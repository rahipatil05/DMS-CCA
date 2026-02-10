import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { sendMessage, getConversation, clearChat } from "../controllers/chat.controller.js";

const router = express.Router();

// Support both /api/chat and /api/chat/message for sending messages
router.post("/", isAuth, sendMessage);
router.post("/message", isAuth, sendMessage);
router.get("/:agentId", isAuth, getConversation);
router.delete("/:agentId", isAuth, clearChat);

export default router;
