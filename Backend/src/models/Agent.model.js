import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    prompt: {
      type: String,
      required: true
    },

    isCustom: {
      type: Boolean,
      default: false
    },

    createdByType: {
      type: String,
      enum: ["admin", "user"],
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Agent", agentSchema);
