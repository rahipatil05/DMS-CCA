import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  getAllAgents,
  createAgentAdmin,
  updateAgentAdmin,
  deleteAgentAdmin,
  getPlatformStats,
  getAllConversations,
  adminChatQuery,
  enhancePrompt
} from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(isAuth, isAdmin);

// ── Users ──
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// ── Agents ──
router.get("/agents", getAllAgents);
router.post("/agents", createAgentAdmin);
router.put("/agents/:id", updateAgentAdmin);
router.delete("/agents/:id", deleteAgentAdmin);

// ── Platform Stats ──
router.get("/stats", getPlatformStats);

// ── Conversations ──
router.get("/conversations", getAllConversations);

// ── AI DB Chatbot ──
router.post("/chat-query", adminChatQuery);

// ── Prompt Enhancer ──
router.post("/enhance-prompt", enhancePrompt);

export default router;