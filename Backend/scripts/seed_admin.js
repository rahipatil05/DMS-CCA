/**
 * seed_admin.js
 * -------------------------------------------------
 * Safe admin credential seeder.
 * ✅ Does NOT delete any existing data.
 * ✅ Creates admin user if it doesn't exist.
 * ✅ If admin email already exists, upgrades it to admin role.
 * -------------------------------------------------
 * Run: node scripts/seed_admin.js
 * -------------------------------------------------
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.model.js";

// ── Admin credentials ──────────────────────────────────────────────────────
const ADMIN_NAME     = "Admin";
const ADMIN_EMAIL    = "admin@dmsm.com";
const ADMIN_PASSWORD = "admin123";
// ──────────────────────────────────────────────────────────────────────────

const seedAdmin = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Upsert: update if exists, insert if not
    const result = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      {
        $set: {
          fullName: ADMIN_NAME,
          email:    ADMIN_EMAIL,
          password: hashedPassword,
          role:     "admin"
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const action = result.createdAt?.getTime() === result.updatedAt?.getTime()
      ? "created"
      : "updated";

    console.log("\n✅ Admin seeded successfully!\n");
    console.log("──────────────────────────────");
    console.log(`  Email    : ${ADMIN_EMAIL}`);
    console.log(`  Password : ${ADMIN_PASSWORD}`);
    console.log(`  Role     : admin`);
    console.log(`  Status   : ${action}`);
    console.log("──────────────────────────────\n");
    console.log("🔐 Login at: http://localhost:5173/auth\n");

  } catch (error) {
    console.error("❌ Seeding error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();
