import express from "express";
import { isAuth } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { getAllUsers, deleteUser, getAllAgents } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(isAuth, isAdmin);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/agents", getAllAgents);

export default router;