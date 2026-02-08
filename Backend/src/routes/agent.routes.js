import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { createAgent, getAgents , deleteAgent} from "../controllers/agent.controller.js";

const router = express.Router();
router.get("/", isAuth, getAgents);
router.post("/", isAuth, createAgent);
router.delete("/:id", isAuth, deleteAgent);

export default router;
