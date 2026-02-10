import Agent from "../models/Agent.model.js";
import Conversation from "../models/Conversation.model.js";
import User from "../models/User.model.js";

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get total chats count for this user
        const totalChats = await Conversation.countDocuments({ userId: userId });

        // Get default agents count (global, not user-specific)
        const defaultAgents = await Agent.countDocuments({ isDefault: true });

        // Get custom agents count (created by this user)
        const customAgents = await Agent.countDocuments({
            createdBy: userId,
            isCustom: true
        });

        // Get all agents available to this user (default + their custom ones)
        const agents = await Agent.find({
            $or: [
                { isDefault: true },
                { createdBy: userId }
            ]
        }).select('name description icon color isDefault isCustom');

        res.status(200).json({
            totalChats,
            defaultAgents,
            customAgents,
            agents
        });
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const userId = req.user._id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, email },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};
