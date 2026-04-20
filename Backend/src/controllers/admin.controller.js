import User from "../models/User.model.js";
import Agent from "../models/Agent.model.js";
import Conversation from "../models/Conversation.model.js";
import mongoose from "mongoose";
import { Ollama } from "ollama";

const ollamaClient = new Ollama({ host: "http://localhost:11434" });


// ── Existing ──────────────────────────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ _id: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Also remove their conversations
    await Conversation.deleteMany({ userId: req.params.id });
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find()
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });
    res.json(agents);
  } catch (error) {
    console.error("Error getting agents:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ── New: Update User ──────────────────────────────────────────────────────────

export const updateUser = async (req, res) => {
  try {
    const { fullName, email, role } = req.body;
    const allowed = {};
    if (fullName) allowed.fullName = fullName;
    if (email)    allowed.email    = email;
    if (role && ["user", "admin"].includes(role)) allowed.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: allowed },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ── New: Create Agent (admin) ────────────────────────────────────────────────

export const createAgentAdmin = async (req, res) => {
  try {
    const { name, description, prompt, icon, color, isDefault, isPublic, preferredLength } = req.body;
    if (!name || !prompt) return res.status(400).json({ message: "Name and prompt required" });

    const agent = await Agent.create({
      name,
      description: description || "",
      prompt,
      icon: icon || "Bot",
      color: color || "from-blue-500 to-cyan-500",
      isDefault: isDefault ?? false,
      isCustom:  false,
      isPublic:  isPublic ?? true,
      createdByType: "admin",
      createdBy: req.user._id,
      preferredLength: preferredLength || "medium"
    });

    res.status(201).json(agent);
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ── New: Update Agent (admin) ────────────────────────────────────────────────

export const updateAgentAdmin = async (req, res) => {
  try {
    const { name, description, prompt, icon, color, isDefault, isPublic, preferredLength } = req.body;
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description, prompt, icon, color, isDefault, isPublic, preferredLength } },
      { new: true }
    );
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json(agent);
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ── New: Delete Agent (admin, any agent) ────────────────────────────────────

export const deleteAgentAdmin = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json({ message: "Agent deleted", agentId: req.params.id });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ── New: Platform Stats ──────────────────────────────────────────────────────

export const getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalAgents, totalConversations] = await Promise.all([
      User.countDocuments(),
      Agent.countDocuments(),
      Conversation.countDocuments()
    ]);

    // Total message count across all convos
    const msgAgg = await Conversation.aggregate([
      { $project: { count: { $size: "$messages" } } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);
    const totalMessages = msgAgg[0]?.total || 0;

    // Avg messages per conversation
    const avgMsgPerConvo = totalConversations > 0
      ? Math.round(totalMessages / totalConversations)
      : 0;

    // Platform-wide emotion distribution
    const emotionAgg = await Conversation.aggregate([
      { $unwind: "$messages" },
      { $match: { "messages.emotion": { $exists: true } } },
      { $group: { _id: "$messages.emotion", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const dominantEmotion = emotionAgg[0]?._id || "neutral";

    // New user registrations — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const userGrowth = await User.aggregate([
      { $match: { _id: { $gte: mongoose.Types.ObjectId.createFromTime(sixMonthsAgo.getTime() / 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: { $toDate: "$_id" } } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly conversation volume — last 6 months
    const convoGrowth = await Conversation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          conversations: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Merge user/convo growth by month
    const months = new Set([...userGrowth.map(d => d._id), ...convoGrowth.map(d => d._id)]);
    const monthlyActivity = Array.from(months).sort().map(month => ({
      month,
      users: userGrowth.find(d => d._id === month)?.count || 0,
      conversations: convoGrowth.find(d => d._id === month)?.conversations || 0
    }));

    // Agent usage: messages per agent
    const agentUsage = await Conversation.aggregate([
      {
        $group: {
          _id: "$agentId",
          conversations: { $sum: 1 },
          messages: { $sum: { $size: "$messages" } }
        }
      },
      { $sort: { messages: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "agents",
          localField: "_id",
          foreignField: "_id",
          as: "agent"
        }
      },
      { $unwind: "$agent" },
      {
        $project: {
          name: "$agent.name",
          icon: "$agent.icon",
          isDefault: "$agent.isDefault",
          conversations: 1,
          messages: 1
        }
      }
    ]);

    // Most active users
    const topUsers = await Conversation.aggregate([
      {
        $group: {
          _id: "$userId",
          conversations: { $sum: 1 },
          messages: { $sum: { $size: "$messages" } }
        }
      },
      { $sort: { messages: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          fullName: "$user.fullName",
          email: "$user.email",
          role: "$user.role",
          conversations: 1,
          messages: 1
        }
      }
    ]);

    // Last 30 days daily message volume
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30Days = await Conversation.aggregate([
      { $unwind: "$messages" },
      { $match: { "messages.createdAt": { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$messages.createdAt" } },
          messages: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      summary: {
        totalUsers,
        totalAgents,
        totalConversations,
        totalMessages,
        avgMsgPerConvo,
        dominantEmotion
      },
      emotionDistribution: emotionAgg.map(e => ({
        emotion: e._id,
        count: e.count,
        percentage: totalMessages > 0 ? Math.round((e.count / totalMessages) * 100) : 0
      })),
      monthlyActivity,
      agentUsage,
      topUsers,
      last30Days: last30Days.map(d => ({
        label: d._id.slice(5),
        messages: d.messages
      }))
    });
  } catch (error) {
    console.error("Error getting platform stats:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ── New: All Conversations ───────────────────────────────────────────────────

export const getAllConversations = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find()
        .populate("userId",  "fullName email")
        .populate("agentId", "name icon")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments()
    ]);

    const formatted = conversations.map(c => ({
      _id: c._id,
      user: c.userId,
      agent: c.agentId,
      messageCount: c.messages?.length || 0,
      lastMessage: c.messages?.at(-1)?.content?.slice(0, 100) || "",
      lastEmotion: c.messages?.at(-1)?.emotion || "neutral",
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messages: c.messages
    }));

    res.json({ conversations: formatted, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ── New: AI DB Chatbot ───────────────────────────────────────────────────────

const SCHEMA_CONTEXT = `
You are an expert MongoDB/Mongoose query assistant for the "Multi Personalized AI Agent Platform".
The database has 3 collections:

1. users  (Mongoose model: User)
   Fields: _id, fullName (String), email (String), role ("user"|"admin"), dob (String),
           interests ([String]), personalityTraits ([String]), createdAt, updatedAt

2. agents  (Mongoose model: Agent)
   Fields: _id, name (String), description (String), prompt (String), icon (String),
           color (String), isDefault (Boolean), isCustom (Boolean), isPublic (Boolean),
           createdByType ("admin"|"user"), createdBy (ObjectId -> User),
           preferredLength ("small"|"medium"|"long"), createdAt, updatedAt

3. conversations  (Mongoose model: Conversation)
   Fields: _id, userId (ObjectId -> User), agentId (ObjectId -> Agent),
           messages ([{ role ("user"|"assistant"), content (String), emotion (String), createdAt }]),
           createdAt, updatedAt

RULES:
- Use Mongoose models: User, Agent, Conversation
- Output ONLY a single JavaScript expression — no async/await, no .then(), no require/import
- The expression must evaluate directly to a Promise (i.e. a Mongoose query or aggregate call)
- Do NOT chain .then() — the result will be awaited externally
- Always use .lean() on find() queries for performance
- Never modify or delete data

EXAMPLES:

Q: How many users are there?
A: User.countDocuments()

Q: Show me all admin users
A: User.find({ role: "admin" }).select("-password").lean()

Q: How many conversations happened today?
A: Conversation.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } })

Q: How many messages were sent in the last 7 days?
A: Conversation.aggregate([{ $match: { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } }, { $project: { msgCount: { $size: "$messages" } } }, { $group: { _id: null, total: { $sum: "$msgCount" } } }])

Q: Which agent has the most conversations?
A: Conversation.aggregate([{ $group: { _id: "$agentId", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 1 }, { $lookup: { from: "agents", localField: "_id", foreignField: "_id", as: "agent" } }, { $unwind: "$agent" }, { $project: { _id: 0, name: "$agent.name", conversations: "$count" } }])

Q: Top 5 most active users by message count
A: Conversation.aggregate([{ $group: { _id: "$userId", messages: { $sum: { $size: "$messages" } } } }, { $sort: { messages: -1 } }, { $limit: 5 }, { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } }, { $unwind: "$user" }, { $project: { _id: 0, name: "$user.fullName", email: "$user.email", messages: 1 } }])

Q: What is the most common emotion across all messages?
A: Conversation.aggregate([{ $unwind: "$messages" }, { $group: { _id: "$messages.emotion", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }, { $project: { _id: 0, emotion: "$_id", count: 1 } }])

Q: Show me all custom agents created by users
A: Agent.find({ createdByType: "user" }).populate("createdBy", "fullName email").lean()

Q: How many users registered this month?
A: User.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } })

Now answer this question with ONLY the JS expression (no explanation, no markdown, no code block):
`;

const DESTRUCTIVE = [
  "deleteMany", "deleteOne", "findByIdAndDelete", "findOneAndDelete",
  "remove", "drop", "updateMany", "updateOne", "findByIdAndUpdate", "findOneAndUpdate",
  "insertMany", "create", "save"
];

// Match .methodName( to avoid substring false-positives like "createdAt" matching "create"
const isDestructiveQuery = (code) =>
  DESTRUCTIVE.some(op => new RegExp(`\\.${op}\\s*\\(`).test(code));

export const adminChatQuery = async (req, res) => {
  try {
    const { question, ollamaModel = "llama3.1" } = req.body;
    if (!question?.trim()) return res.status(400).json({ message: "Question is required" });

    // 1. Ask Ollama to generate a query
    let queryCode = "";
    try {
      const response = await ollamaClient.generate({
        model: ollamaModel,
        prompt: SCHEMA_CONTEXT + question,
        stream: false,
        options: { temperature: 0.1, num_predict: 300 }
      });
      queryCode = (response.response || "").trim();
    } catch (err) {
      return res.status(503).json({
        message: "Ollama LLM is not available. Make sure Ollama is running with: ollama serve",
        error: err.message
      });
    }

    // 2. Strip markdown code fences if present
    queryCode = queryCode.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
    // Remove any leading explanation lines (keep only the last line if multiple)
    const lines = queryCode.split("\n").filter(l => l.trim());
    queryCode = lines[lines.length - 1] || queryCode;

    // 3. Safety check — block destructive operations (regex match on .method() calls only)
    if (isDestructiveQuery(queryCode)) {
      return res.status(403).json({
        message: "⛔ Destructive query blocked. The generated query contains a write/delete operation.",
        generatedQuery: queryCode
      });
    }

    // 4. Execute the query in a limited context
    let result;
    try {
      const queryFn = new Function("User", "Agent", "Conversation", `return (${queryCode})`);
      const promise = queryFn(User, Agent, Conversation);
      result = await promise;
    } catch (execErr) {
      return res.status(422).json({
        message: "Failed to execute generated query",
        generatedQuery: queryCode,
        error: execErr.message
      });
    }

    // 5. Normalise result: wrap single objects into an array so the frontend table works
    if (result !== null && typeof result === "object" && !Array.isArray(result)) {
      result = [result];
    }

    res.json({
      question,
      generatedQuery: queryCode,
      result,
      resultCount: Array.isArray(result) ? result.length : typeof result === "number" ? result : null,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Admin chat query error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Legacy deleteAgent kept for agent routes compatibility
export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await Agent.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!agent) return res.status(403).json({ message: "You are not allowed to delete this agent" });
    res.status(200).json({ message: "Agent deleted successfully", agentId: id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete agent", error: err.message });
  }
};

// ── New: Enhance Agent Prompt via Ollama ────────────────────────────────────

const ENHANCE_SYSTEM = `You are an expert AI system-prompt engineer. Your job is to take a rough or short agent description and rewrite it into a detailed, high-quality system prompt for an AI companion agent.

Rules:
- Write in second person ("You are…")
- Be specific about personality, tone, capabilities, and limits
- Include behavioral guidelines (e.g. how to handle sensitive topics, how to greet, communication style)
- Keep it professional yet warm
- Length: 3-6 sentences minimum, 10-12 sentences maximum
- Do NOT include markdown headings, bullet points, or code blocks in the output — plain prose only
- Output ONLY the enhanced system prompt. No preamble, no explanation.

Draft agent description to enhance:
`;

export const enhancePrompt = async (req, res) => {
  try {
    const { draft, agentName = "AI Agent", ollamaModel = "llama3.1" } = req.body;
    if (!draft?.trim()) return res.status(400).json({ message: "Draft prompt is required" });

    let enhanced = "";
    try {
      const response = await ollamaClient.generate({
        model: ollamaModel,
        prompt: ENHANCE_SYSTEM + `Agent Name: ${agentName}\nDraft: ${draft}`,
        stream: false,
        options: { temperature: 0.7, num_predict: 500 }
      });
      enhanced = (response.response || "").trim();
    } catch (err) {
      return res.status(503).json({
        message: "Ollama is not available. Make sure it is running with: ollama serve",
        error: err.message
      });
    }

    if (!enhanced) return res.status(500).json({ message: "Ollama returned an empty response" });

    res.json({ enhanced, model: ollamaModel });
  } catch (error) {
    console.error("enhancePrompt error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};