import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    prompt: {
      type: String,
      required: true
    },

    icon: {
      type: String,
      default: "Bot"
    },

    color: {
      type: String,
      default: "from-blue-500 to-cyan-500"
    },

    isDefault: {
      type: Boolean,
      default: false
    },

    isCustom: {
      type: Boolean,
      default: false
    },

    isPublic: {
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
    },
    preferredLength: {
      type: String,
      enum: ["small", "medium", "long"],
      default: "medium"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Agent", agentSchema);
