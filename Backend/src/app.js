import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

const IS_DEV = process.env.NODE_ENV !== "production";

/* ---------- Middlewares ---------- */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

/* ---------- CORS ---------- */
// CLIENT_URL supports comma-separated origins for multi-env setups
// e.g. CLIENT_URL=https://app.example.com,http://localhost:5173
const rawOrigins = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

/* ---------- Dev request logger ---------- */
if (IS_DEV) {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

/* ---------- Routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/analytics", analyticsRoutes);

/* ---------- Health ---------- */
app.get("/", (_req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" });
});

/* ---------- 404 ---------- */
app.use((req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
});

/* ---------- Global error handler ---------- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = IS_DEV ? err.message : "Internal server error";
  if (IS_DEV) console.error("[Error]", err);
  res.status(status).json({ message });
});

export default app;
