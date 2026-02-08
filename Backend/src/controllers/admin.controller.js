import User from "../models/User.model.js";
import Agent from "../models/Agent.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (error) {
    console.error("Error getting agents:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

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
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete agent",
      error: err.message
    });
  }
};