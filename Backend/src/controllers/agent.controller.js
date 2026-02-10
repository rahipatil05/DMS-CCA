import Agent from "../models/Agent.model.js";
import mongoose from "mongoose";
import { enhancePrompt as enhancePromptService } from "../services/prompt_enhancer.service.js";

export const createAgent = async (req, res) => {
  try {
    const { name, prompt } = req.body;

    if (!name || !prompt) {
      return res.status(400).json({ message: "Name and prompt are required" });
    }

    const agent = await Agent.create({
      ...req.body,
      createdBy: req.user._id,
      createdByType: req.user.role === "admin" ? "admin" : "user"
    });
    res.json(agent);
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({
      $or: [
        { isPublic: true },
        { createdBy: req.user._id },
        { createdByType: "admin" }
      ]
    });
    res.json(agents);
  } catch (error) {
    console.error("Error getting agents:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ SAFE validation
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid agent ID"
      });
    }

    const agent = await Agent.findOneAndDelete({
      _id: id,
      createdBy: req.user._id
    });

    if (!agent) {
      return res.status(403).json({
        message: "You are not allowed to delete this agent"
      });
    }

    res.status(200).json({
      message: "Agent deleted successfully",
      agentId: id
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const enhancePrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ message: "Prompt is required for enhancement" });
    }

    const enhanced = await enhancePromptService(prompt);
    res.json({ enhanced });
  } catch (error) {
    console.error("Error in enhancePrompt controller:", error);
    res.status(500).json({ message: "Failed to enhance prompt", error: error.message });
  }
};