import mongoose from "mongoose";

export const ALLOWED_GEMINI_MODELS = [
  "gemini-3.8-flash",       // Primary free tier default (fast, structured outputs)
  "gemini-3.5-flash-lite",  // Secondary fallback (lowest latency, high throughput)
  "gemini-3.1-pro",         // Deep reasoning
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "simulated",
];

const aiLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
    },
    model: {
      type: String,
      enum: ALLOWED_GEMINI_MODELS,
      default: () => process.env.GEMINI_MODEL || "gemini-3.8-flash",
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "fallback_simulated", "rate_limited", "error"],
      required: true,
      index: true,
    },
    httpStatusCode: {
      type: Number,
      default: 200,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    tokens: {
      promptTokens: { type: Number, default: 0 },
      candidatesTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    responseLength: {
      type: Number,
      default: 0,
    },
    promptPreview: {
      type: String,
      maxlength: 500,
      default: "",
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for free-tier rate monitoring (RPD, TPM, RPM)
aiLogSchema.index({ createdAt: -1, status: 1 });
aiLogSchema.index({ createdAt: -1, model: 1 });

// Automatic log expiration after 30 days
aiLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

// Preemptive daily quota checker (Free tier typically allows 250-1000 RPD)
aiLogSchema.statics.hasDailyQuotaRemaining = async function (dailyLimit = 500) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const callsToday = await this.countDocuments({
    createdAt: { $gte: startOfDay },
    status: { $in: ["success", "rate_limited"] },
  });

  return callsToday < dailyLimit;
};

const AiLog = mongoose.models.AiLog || mongoose.model("AiLog", aiLogSchema);
export default AiLog;
