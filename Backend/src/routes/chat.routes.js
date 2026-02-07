import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { sendMessage } from "../controllers/chat.controller.js";

const router = express.Router();

// Support both /api/chat and /api/chat/message for sending messages
router.post("/", isAuth, sendMessage);
router.post("/message", isAuth, sendMessage);

export default router;
