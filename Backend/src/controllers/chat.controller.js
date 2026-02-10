import Chat from "../models/Conversation.model.js";
import Agent from "../models/Agent.model.js";
import { detectEmotion } from "../services/emotion.service.js";
import { getOllamaReply } from "../services/ollama.service.js";

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
    await chat.save(); // Save immediately so it persists if user switches agents

    // Get AI reply
    const reply = await getOllamaReply(
      agent.prompt,
      chat.messages,
      emotionLabel,
      req.user, // Pass full user profile for personalization
      agent.preferredLength
    );

    // Intercept and parse Self-Discovery block
    let discoveries = null;
    let cleanReply = reply;
    const discoveryRegex = /:::DISCOVERY:::([\s\S]*?)(:::|$)/;
    const discoveryMatch = reply.match(discoveryRegex);

    if (discoveryMatch) {
      try {
        discoveries = JSON.parse(discoveryMatch[1].trim());
      } catch (e) {
        console.error("Error parsing discovery JSON:", e);
      }
      // Always remove the block from the reply that the user sees
      cleanReply = reply.replace(discoveryRegex, "").trim();
    }

    // Add assistant message
    chat.messages.push({
      role: "assistant",
      content: cleanReply,
      emotion: emotionLabel
    });

    await chat.save();

    res.json({ reply: cleanReply, emotion: emotionData, discoveries });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required" });
    }

    const chat = await Chat.findOne({
      userId: req.user._id,
      agentId
    });

    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json(chat);
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required" });
    }

    const chat = await Chat.findOne({
      userId: req.user._id,
      agentId
    });

    if (chat) {
      chat.messages = [];
      await chat.save();
    }

    res.json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

