import Agent from "../models/Agent.model.js";

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
        { createdBy: req.user._id }
      ]
    });
    res.json(agents);
  } catch (error) {
    console.error("Error getting agents:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
