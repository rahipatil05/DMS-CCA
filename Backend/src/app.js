import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Log every incoming request for debugging
app.use((req, res, next) => {
  console.log("REQ:", req.method, req.originalUrl);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

// Simple health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Catch-all 404 handler to see what path is failing
app.use((req, res) => {
  console.warn("404:", req.method, req.originalUrl);
  res.status(404).json({
    message: `Not found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;
