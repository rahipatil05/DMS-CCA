import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { getUserAnalytics, generateWellnessJournal } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/journal", isAuth, generateWellnessJournal);
router.get("/", isAuth, getUserAnalytics);

export default router;
