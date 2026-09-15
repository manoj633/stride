import mongoose from "mongoose";

const aiLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
    },
    model: {
      type: String,
      default: "gemini-2.5-flash",
    },
    status: {
      type: String,
      enum: ["success", "fallback_simulated", "error"],
      required: true,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    promptPreview: {
      type: String,
      default: "",
    },
    responseLength: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

aiLogSchema.index({ createdAt: -1 });
aiLogSchema.index({ userId: 1 });
aiLogSchema.index({ status: 1 });

const AiLog = mongoose.model("AiLog", aiLogSchema);

export default AiLog;
