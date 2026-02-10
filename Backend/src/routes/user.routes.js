import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { getDashboardStats, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/dashboard-stats", isAuth, getDashboardStats);
router.put("/profile", isAuth, updateProfile);

export default router;
