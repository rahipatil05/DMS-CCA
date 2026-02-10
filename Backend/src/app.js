import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

/* ---------- Middlewares ---------- */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true
  })
);

/* ---------- Debug logger ---------- */
app.use((req, res, next) => {
  console.log("REQ:", req.method, req.originalUrl);
  next();
});

/* ---------- Routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

/* ---------- Health ---------- */
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------- 404 ---------- */
app.use((req, res) => {
  console.warn("404:", req.method, req.originalUrl);
  res.status(404).json({
    message: `Not found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;
