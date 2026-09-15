import mongoose from "mongoose";

const rateLimitLogSchema = new mongoose.Schema(
  {
    limiter: {
      type: String,
      required: true,
      enum: [
        "loginLimiter",
        "passwordResetLimiter",
        "twoFactorLimiter",
        "registerLimiter",
        "commentLimiter",
        "generalLimiter",
      ],
    },
    ip: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    blockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

rateLimitLogSchema.index({ createdAt: -1 });
rateLimitLogSchema.index({ createdAt: 1 }, { expires: 60 * 60 * 24 * 30 }); // 30 days
rateLimitLogSchema.index({ limiter: 1 });
rateLimitLogSchema.index({ ip: 1 });
rateLimitLogSchema.index({ email: 1 });

const RateLimitLog = mongoose.model("RateLimitLog", rateLimitLogSchema);

export default RateLimitLog;
