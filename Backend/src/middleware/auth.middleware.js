import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { ENV } from "../lib/env.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      res.cookie("jwt", "", { maxAge: 0 }); // Clear the invalid cookie
      return res.status(401).json({ message: "Session invalid. Please login again." });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
