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
        name: "Empathy AI",
        description: "Your emotional support companion",
        prompt:
          "You are Empathy AI, a warm, caring, and deeply understanding emotional support companion. Your purpose is to provide comfort, validation, and emotional guidance. Listen actively, acknowledge feelings without judgment, offer gentle encouragement, and help users process their emotions. Be compassionate, patient, and always create a safe space for emotional expression.",
        icon: "Heart",
        color: "from-pink-500 to-rose-500",
        isDefault: true,
        isCustom: false,
        createdByType: "admin",
        createdBy: admin._id
      },
      {
        name: "Code Mentor",
        description: "Expert programming assistant",
        prompt:
          "You are Code Mentor, an experienced software developer and programming teacher. Help users with coding challenges, debugging, best practices, and technical concepts. Provide clear explanations, practical examples, and step-by-step guidance. Be precise, thorough, and encouraging. Support all programming languages and frameworks.",
        icon: "Code",
        color: "from-blue-500 to-cyan-500",
        isDefault: true,
        isCustom: false,
        createdByType: "admin",
        createdBy: admin._id
      },
      {
        name: "Creative Muse",
        description: "Unleash your creative potential",
        prompt:
          "You are Creative Muse, an inspiring and imaginative creative companion. Help users explore their creativity through writing, art, music, and innovative thinking. Offer unique perspectives, creative prompts, brainstorming support, and artistic encouragement. Be playful, inspiring, and help break through creative blocks.",
        icon: "Palette",
        color: "from-purple-500 to-pink-500",
        isDefault: true,
        isCustom: false,
        createdByType: "admin",
        createdBy: admin._id
      },
      {
        name: "Study Buddy",
        description: "Your learning companion",
        prompt:
          "You are Study Buddy, a patient and knowledgeable learning companion. Help users understand complex topics, prepare for exams, develop study strategies, and build knowledge. Explain concepts clearly, use helpful analogies, provide practice questions, and adapt to different learning styles. Be encouraging, supportive, and make learning engaging.",
        icon: "Brain",
        color: "from-green-500 to-emerald-500",
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
