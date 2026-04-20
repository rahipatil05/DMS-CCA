import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Force secure cross-domain cookies if deployed (or if vercel URL is present)
  const isCrossDomain = ENV.NODE_ENV === "production" || String(ENV.CLIENT_URL).includes("vercel.app");

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,                   // prevent XSS attacks
    sameSite: isCrossDomain ? "none" : "lax", // none is REQUIRED for cross-domain cookies (Vercel <-> Render)
    secure: isCrossDomain,                   // HTTPS only in production
    path: "/",
  });

  return token;
};
