import express from "express";
import { signup, login, logout, updateProfile, deleteAccountData, clearAgentChat, checkAuth } from "../controllers/auth.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/check-auth", isAuth, checkAuth);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", isAuth, updateProfile);
router.delete("/delete-account-data", isAuth, deleteAccountData);
router.delete("/clear-agent-chat/:agentId", isAuth, clearAgentChat);

export default router;
