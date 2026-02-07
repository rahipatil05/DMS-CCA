import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { createAgent, getAgents } from "../controllers/agent.controller.js";

const router = express.Router();
router.get("/", isAuth, getAgents);
router.post("/", isAuth, createAgent);
// router.post("/", isAuth, dltAgent); dlt agent routes todo
export default router;
