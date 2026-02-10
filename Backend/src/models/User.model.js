import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  dob: String,
  interests: [String],
  personalityTraits: [String]
});

export default mongoose.model("User", userSchema);
