import User from "../models/User.model.js";
import Agent from "../models/Agent.model.js";
import Conversation from "../models/Conversation.model.js";
import mongoose from "mongoose";
import Groq from "groq-sdk";

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = "llama-3.1-8b-instant";


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

// ── New: AI DB Chatbot (Upgraded — Multi-turn, Summarized, Self-Healing) ────

const SCHEMA_CONTEXT = `
You are an expert MongoDB/Mongoose query generator for the "Multi Personalized AI Agent Platform" (DMSM CCA).
Your job is to convert natural-language admin questions into precise Mongoose queries.

═══════════════════════════════════════════
DATABASE SCHEMA (3 collections)
═══════════════════════════════════════════

1. users (Model: User)
   ┌──────────────────┬──────────────────────────────────────────────────┐
   │ Field            │ Type & Notes                                     │
   ├──────────────────┼──────────────────────────────────────────────────┤
   │ _id              │ ObjectId (auto, encodes creation timestamp)      │
   │ fullName         │ String                                           │
   │ email            │ String (unique)                                  │
   │ password         │ String (NEVER select this)                       │
   │ role             │ String, enum: "user" | "admin"                   │
   │ dob              │ String (date of birth)                           │
   │ interests        │ [String] — discovered hobbies/passions           │
   │ personalityTraits│ [String] — discovered traits (e.g. "introvert") │
   └──────────────────┴──────────────────────────────────────────────────┘
   Note: No createdAt/updatedAt timestamps. Use _id for time-based queries:
     mongoose.Types.ObjectId.createFromTime(dateInSeconds)

2. agents (Model: Agent)
   ┌──────────────────┬──────────────────────────────────────────────────┐
   │ Field            │ Type & Notes                                     │
   ├──────────────────┼──────────────────────────────────────────────────┤
   │ _id              │ ObjectId (auto)                                  │
   │ name             │ String (required) — agent display name           │
   │ description      │ String                                           │
   │ prompt           │ String (required) — system prompt                │
   │ icon             │ String (default "Bot") — lucide icon name        │
   │ color            │ String — gradient class                          │
   │ isDefault        │ Boolean — system-provided agent                  │
   │ isCustom         │ Boolean — user-created agent                     │
   │ isPublic         │ Boolean — visible to all users                   │
   │ createdByType    │ String, enum: "admin" | "user"                   │
   │ createdBy        │ ObjectId ref → User                              │
   │ preferredLength  │ String, enum: "small" | "medium" | "long"        │
   │ createdAt        │ Date (auto via timestamps)                       │
   │ updatedAt        │ Date (auto via timestamps)                       │
   └──────────────────┴──────────────────────────────────────────────────┘

3. conversations (Model: Conversation)
   ┌──────────────────┬──────────────────────────────────────────────────┐
   │ Field            │ Type & Notes                                     │
   ├──────────────────┼──────────────────────────────────────────────────┤
   │ _id              │ ObjectId (auto)                                  │
   │ userId           │ ObjectId ref → User                              │
   │ agentId          │ ObjectId ref → Agent                             │
   │ messages         │ Array of sub-documents:                          │
   │                  │   { role: "user"|"assistant",                    │
   │                  │     content: String,                             │
   │                  │     emotion: enum ["happy","sad","lonely",       │
   │                  │       "angry","anxious","confused","neutral"],   │
   │                  │     createdAt: Date }                            │
   │ mutedUntil       │ Date | null                                      │
   │ createdAt        │ Date (auto via timestamps)                       │
   │ updatedAt        │ Date (auto via timestamps)                       │
   └──────────────────┴──────────────────────────────────────────────────┘

═══════════════════════════════════════════
RELATIONSHIPS
═══════════════════════════════════════════
- Conversation.userId → User._id
- Conversation.agentId → Agent._id
- Agent.createdBy → User._id
- Use $lookup for joins: { from: "users", localField: "userId", foreignField: "_id", as: "user" }

═══════════════════════════════════════════
RESPONSE FORMAT (STRICT)
═══════════════════════════════════════════
Always respond with ONLY a valid JSON object:
{
  "message": "Brief explanation of what data you're fetching.",
  "query": "Single JS expression returning a Promise — or null if no DB query needed."
}

QUERY RULES:
- Must be a single JS expression evaluating to a Promise (e.g. User.countDocuments()).
- NO async/await, NO .then(), NO variable declarations, NO semicolons.
- Always use .lean() after .find() or .findOne().
- Always use .select('-password') when querying Users.
- NEVER use destructive operations (delete, update, create, save, drop).
- For User time-based queries, use: mongoose.Types.ObjectId.createFromTime(Math.floor(new Date("YYYY-MM-DD").getTime()/1000))
- For Conversation/Agent time-based queries, use the createdAt field directly.
- mongoose is available as a global variable.

═══════════════════════════════════════════
QUERY EXAMPLES (study these patterns)
═══════════════════════════════════════════

Q: How many users are registered?
A: {"message": "Total registered users:", "query": "User.countDocuments()"}

Q: Show all admin users
A: {"message": "All administrator accounts:", "query": "User.find({ role: 'admin' }).select('-password').lean()"}

Q: Which agent is most popular?
A: {"message": "Agent ranked by total messages received:", "query": "Conversation.aggregate([{ $group: { _id: '$agentId', totalMessages: { $sum: { $size: '$messages' } } } }, { $sort: { totalMessages: -1 } }, { $limit: 5 }, { $lookup: { from: 'agents', localField: '_id', foreignField: '_id', as: 'agent' } }, { $unwind: '$agent' }, { $project: { name: '$agent.name', totalMessages: 1 } }])"}

Q: Top 5 most active users by message count
A: {"message": "Most active users by message volume:", "query": "Conversation.aggregate([{ $group: { _id: '$userId', totalMessages: { $sum: { $size: '$messages' } } } }, { $sort: { totalMessages: -1 } }, { $limit: 5 }, { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }, { $unwind: '$user' }, { $project: { fullName: '$user.fullName', email: '$user.email', totalMessages: 1 } }])"}

Q: Emotion distribution across all messages
A: {"message": "Breakdown of emotions detected in messages:", "query": "Conversation.aggregate([{ $unwind: '$messages' }, { $group: { _id: '$messages.emotion', count: { $sum: 1 } } }, { $sort: { count: -1 } }])"}

Q: How many conversations happened today?
A: {"message": "Conversations created today:", "query": "Conversation.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } })"}

Q: Messages sent in the last 7 days
A: {"message": "Message volume over the past week:", "query": "Conversation.aggregate([{ $unwind: '$messages' }, { $match: { 'messages.createdAt': { $gte: new Date(Date.now() - 7*24*60*60*1000) } } }, { $count: 'totalMessages' }])"}

Q: Show all custom agents created by users
A: {"message": "User-created custom agents:", "query": "Agent.find({ isCustom: true }).populate('createdBy', 'fullName email').lean()"}

Q: Average messages per conversation
A: {"message": "Average message count per conversation:", "query": "Conversation.aggregate([{ $project: { msgCount: { $size: '$messages' } } }, { $group: { _id: null, avgMessages: { $avg: '$msgCount' } } }])"}

Q: Users who have the interest "hiking"
A: {"message": "Users interested in hiking:", "query": "User.find({ interests: 'hiking' }).select('-password').lean()"}

Q: Show me users with personality trait "introvert"
A: {"message": "Users with introvert trait:", "query": "User.find({ personalityTraits: 'introvert' }).select('-password').lean()"}

Q: Daily message count for the last 30 days
A: {"message": "Daily message volume (last 30 days):", "query": "Conversation.aggregate([{ $unwind: '$messages' }, { $match: { 'messages.createdAt': { $gte: new Date(Date.now() - 30*24*60*60*1000) } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$messages.createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }])"}

Q: Which users have never chatted?
A: {"message": "Users with zero conversations:", "query": "User.aggregate([{ $lookup: { from: 'conversations', localField: '_id', foreignField: 'userId', as: 'convos' } }, { $match: { convos: { $size: 0 } } }, { $project: { fullName: 1, email: 1, role: 1 } }])"}

Q: Default agents vs custom agents count
A: {"message": "Breakdown of default vs custom agents:", "query": "Agent.aggregate([{ $group: { _id: { isDefault: '$isDefault', isCustom: '$isCustom' }, count: { $sum: 1 } } }])"}

Q: What is this project?
A: {"message": "DMSM CCA is a Multi Personalized AI Agent Platform — a privacy-first AI companion system featuring local inference via Ollama/Groq, persistent personal behavioral prompts, and an autonomous Self-Discovery engine that evolves the AI persona based on user interactions. It's built with React + Node.js + MongoDB + Groq LLM.", "query": null}

Now answer the following question (Return ONLY valid JSON):
`;

const SUMMARIZE_PROMPT = `You are a data analyst assistant. The admin asked a question and received raw database results. Your job is to provide a clear, well-structured summary.

RULES:
- Be concise but informative
- Use bullet points for lists
- Highlight key numbers and insights
- If the data is a single number, state it clearly with context
- If the data is a table/list, summarize the key takeaways and patterns
- If the result is empty, say so clearly
- Use plain text, no markdown headers
- Keep it under 150 words
- Be conversational and professional

Admin's question: "{question}"
Generated query: {query}
Raw result: {result}

Provide a clear summary:`;

const RETRY_PROMPT = `The previous Mongoose query you generated FAILED with this error:
Error: {error}
Failed query: {failedQuery}

Original question: "{question}"

Please generate a CORRECTED query. Fix the syntax or logic error. Return ONLY valid JSON in the same format:
{
  "message": "Brief explanation",
  "query": "Corrected single JS expression"
}`;

const DESTRUCTIVE = [
  "deleteMany", "deleteOne", "findByIdAndDelete", "findOneAndDelete",
  "remove", "drop", "updateMany", "updateOne", "findByIdAndUpdate", "findOneAndUpdate",
  "insertMany", "create", "save"
];

// Match .methodName( to avoid substring false-positives like "createdAt" matching "create"
const isDestructiveQuery = (code) =>
  DESTRUCTIVE.some(op => new RegExp(`\\.${op}\\s*\\(`).test(code));

// Helper: clean code fences and extract the last meaningful line
const cleanQueryCode = (raw) => {
  let code = raw.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
  const lines = code.split("\n").filter(l => l.trim());
  return lines[lines.length - 1] || code;
};

// Helper: execute a Mongoose query string in a sandboxed context
const executeQuery = async (queryCode) => {
  const queryFn = new Function("User", "Agent", "Conversation", "mongoose", `return (${queryCode})`);
  const promise = queryFn(User, Agent, Conversation, mongoose);
  return await promise;
};

// Helper: ask Groq to summarize raw results
const summarizeResult = async (question, queryCode, rawResult) => {
  try {
    const resultPreview = JSON.stringify(rawResult).slice(0, 2000); // Cap at 2000 chars to stay within token limits
    const prompt = SUMMARIZE_PROMPT
      .replace("{question}", question)
      .replace("{query}", queryCode || "N/A")
      .replace("{result}", resultPreview);

    const response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400
    });
    return (response.choices[0]?.message?.content || "").trim();
  } catch {
    return null; // Summarization failure is non-fatal
  }
};

export const adminChatQuery = async (req, res) => {
  try {
    const { question, history } = req.body;
    if (!question?.trim()) return res.status(400).json({ message: "Question is required" });

    // ── 1. Build multi-turn message array for Groq ──
    const llmMessages = [{ role: "system", content: SCHEMA_CONTEXT }];

    // Inject conversation history (last 10 messages max) for follow-up context
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const h of recentHistory) {
        if (h.role === "user") {
          llmMessages.push({ role: "user", content: h.content });
        } else if (h.role === "assistant" && h.generatedQuery) {
          // Give the LLM context about what query it generated previously
          llmMessages.push({
            role: "assistant",
            content: JSON.stringify({ message: h.content, query: h.generatedQuery })
          });
        }
      }
    }

    // Add the current question
    llmMessages.push({ role: "user", content: question });

    // ── 2. Ask Groq to generate query ──
    let parsedResponse = { message: "", query: null };
    try {
      const response = await groqClient.chat.completions.create({
        model: GROQ_MODEL,
        messages: llmMessages,
        temperature: 0.1,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });
      const generatedString = (response.choices[0]?.message?.content || "").trim();
      parsedResponse = JSON.parse(generatedString);
    } catch (err) {
      return res.status(503).json({
        message: "Failed to generate AI response. Make sure Groq is available and returning valid JSON.",
        error: err.message
      });
    }

    let textResponse = parsedResponse.message || "Here is the result:";
    let queryCode = parsedResponse.query;

    // ── 3. No query needed — return text-only response ──
    if (!queryCode) {
      return res.json({
        question,
        generatedQuery: null,
        explanation: textResponse,
        summary: textResponse,
        result: textResponse,
        resultCount: null,
        timestamp: new Date()
      });
    }

    // ── 4. Clean and validate query ──
    queryCode = cleanQueryCode(queryCode);

    if (isDestructiveQuery(queryCode)) {
      return res.status(403).json({
        message: "⛔ Destructive query blocked. The generated query contains a write/delete operation.",
        generatedQuery: queryCode
      });
    }

    // ── 5. Execute query (with one retry on failure) ──
    let result;
    let finalQueryCode = queryCode;
    try {
      result = await executeQuery(queryCode);
    } catch (execErr) {
      // Self-healing retry: tell the LLM about the error and ask for a corrected query
      try {
        const retryPrompt = RETRY_PROMPT
          .replace("{error}", execErr.message)
          .replace("{failedQuery}", queryCode)
          .replace("{question}", question);

        const retryResponse = await groqClient.chat.completions.create({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: SCHEMA_CONTEXT + "\n" + retryPrompt }],
          temperature: 0.1,
          max_tokens: 800,
          response_format: { type: "json_object" }
        });

        const retryParsed = JSON.parse((retryResponse.choices[0]?.message?.content || "").trim());
        if (retryParsed.query) {
          finalQueryCode = cleanQueryCode(retryParsed.query);
          if (!isDestructiveQuery(finalQueryCode)) {
            result = await executeQuery(finalQueryCode);
            textResponse = retryParsed.message || textResponse;
          }
        }
      } catch {
        // Both attempts failed
        return res.status(422).json({
          message: "Failed to execute generated query (retry also failed)",
          generatedQuery: queryCode,
          error: execErr.message
        });
      }
    }

    // ── 6. Normalize result ──
    if (result !== null && typeof result === "object" && !Array.isArray(result)) {
      result = [result];
    }

    // ── 7. Summarize result with a second LLM pass ──
    const summary = await summarizeResult(question, finalQueryCode, result);

    // ── 8. Send response ──
    res.json({
      question,
      generatedQuery: finalQueryCode,
      explanation: textResponse || null,
      summary: summary || textResponse || null,
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
    const { draft, agentName = "AI Agent" } = req.body;
    if (!draft?.trim()) return res.status(400).json({ message: "Draft prompt is required" });

    let enhanced = "";
    try {
      const response = await groqClient.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{
          role: "user",
          content: ENHANCE_SYSTEM + `Agent Name: ${agentName}\nDraft: ${draft}`
        }],
        temperature: 0.7,
        max_tokens: 500,
      });
      enhanced = (response.choices[0]?.message?.content || "").trim();
    } catch (err) {
      return res.status(503).json({
        message: "Groq AI is not available. Check your GROQ_API_KEY.",
        error: err.message
      });
    }

    if (!enhanced) return res.status(500).json({ message: "Groq returned an empty response" });

    res.json({ enhanced, model: GROQ_MODEL });
  } catch (error) {
    console.error("enhancePrompt error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};