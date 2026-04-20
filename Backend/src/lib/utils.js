import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProd = ENV.NODE_ENV === "production";

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,                   // prevent XSS attacks
    sameSite: isProd ? "strict" : "lax", // strict in prod, lax in dev (cross-port)
    secure: isProd,                   // HTTPS only in production
    path: "/",
  });

  return token;
};
