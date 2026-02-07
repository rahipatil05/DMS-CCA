import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "./config/db.js";
import User from "./models/User.model.js";
import Agent from "./models/Agent.model.js";

const seed = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Agent.deleteMany({})
    ]);

    // --------------------
    // USERS
    // --------------------
    console.log("👤 Creating demo users...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const users = await User.create([
      {
        name: "Admin One",
        email: "admin1@example.com",
        password: adminPassword,
        role: "admin"
      },
      {
        name: "Admin Two",
        email: "admin2@example.com",
        password: adminPassword,
        role: "admin"
      },
      {
        name: "User One",
        email: "user1@example.com",
        password: userPassword,
        role: "user"
      },
      {
        name: "User Two",
        email: "user2@example.com",
        password: userPassword,
        role: "user"
      },
      {
        name: "User Three",
        email: "user3@example.com",
        password: userPassword,
        role: "user"
      },
      {
        name: "User Four",
        email: "user4@example.com",
        password: userPassword,
        role: "user"
      },
      {
        name: "User Five",
        email: "user5@example.com",
        password: userPassword,
        role: "user"
      }
    ]);

    const admin = users.find(u => u.role === "admin");

    console.log("✅ Users created");

    // --------------------
    // AGENTS (SYSTEM / DEFAULT)
    // --------------------
    console.log("🤖 Creating system agents...");

    await Agent.create([
      {
        name: "Teacher",
        description: "A knowledgeable and patient educator",
        prompt:
          "You are a friendly and patient teacher. Explain concepts clearly, adapt to the user's mood, use examples, and encourage learning with follow-up questions.",
        isDefault: true,
        isCustom: false,
        createdByType: "admin",
        createdBy: admin._id
      },
      {
        name: "Friend",
        description: "A supportive companion",
        prompt:
          "You are a caring and supportive friend. Match the user's emotional state and respond warmly and conversationally.",
        isDefault: true,
        isCustom: false,
        createdByType: "admin",
        createdBy: admin._id
      },
      {
        name: "Coder",
        description: "A skilled programming assistant",
        prompt:
          "You are an experienced software developer. Help with coding, debugging, and best practices using clear examples.",
        isDefault: true,
        isCustom: false,
        createdByType: "admin",
        createdBy: admin._id
      },
      {
        name: "Girlfriend",
        description: "A caring and affectionate companion",
        prompt:
          "You are a loving and supportive girlfriend. Be affectionate, understanding, and emotionally present.",
        isDefault: true,
        isCustom: false,
        createdByType: "admin",
        createdBy: admin._id
      },
      {
        name: "Sister",
        description: "A protective and fun sibling",
        prompt:
          "You are a caring older sister. Offer honest advice, emotional support, and playful encouragement.",
        isDefault: true,
        isCustom: false,
        createdByType: "admin",
        createdBy: admin._id
      }
    ]);

    console.log("🎉 Database seeded successfully!");
    console.log("Admin: admin1@example.com / admin123");
    console.log("User:  user1@example.com / user123");

  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
