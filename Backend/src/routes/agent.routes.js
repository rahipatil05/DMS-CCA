import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { createAgent, getAgents, deleteAgent, enhancePrompt } from "../controllers/agent.controller.js";

const router = express.Router();
router.get("/", isAuth, getAgents);
router.post("/", isAuth, createAgent);
router.post("/enhance-prompt", isAuth, enhancePrompt);
router.delete("/:id", isAuth, deleteAgent);

export default router;
