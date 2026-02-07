import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", isAuth, updateProfile);
export default router;
