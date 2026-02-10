import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true, // prevent XSS attacks
    sameSite: "lax", // Better for cross-port development
    secure: ENV.NODE_ENV !== "development", // HTTPS only in production
    path: "/",
  });

  return token;
};
