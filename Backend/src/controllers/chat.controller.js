import Chat from "../models/Conversation.model.js";
import Agent from "../models/Agent.model.js";
import { detectEmotion } from "../services/emotion.service.js";
import { getGeminiReply } from "../services/gemini.service.js";

export const sendMessage = async (req, res) => {
  try {
    const { agentId, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required" });
    }

    // Verify agent exists first
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Detect emotion (await it since it's async)
    const emotionData = await detectEmotion(message);
    const emotionLabel = emotionData.emotion || "neutral";

    // Find or create conversation
    let chat = await Chat.findOne({
      userId: req.user._id,
      agentId
    });

    if (!chat) {
      chat = await Chat.create({
        userId: req.user._id,
        agentId,
        messages: []
      });
    }

    // Add user message
    chat.messages.push({ role: "user", content: message, emotion: emotionLabel });

    // Get AI reply
    const reply = await getGeminiReply(
      agent.prompt,
      chat.messages,
      emotionLabel
    );

    // Add assistant message
    chat.messages.push({
      role: "assistant",
      content: reply,
      emotion: emotionLabel
    });

    await chat.save();

    res.json({ reply, emotion: emotionData });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
