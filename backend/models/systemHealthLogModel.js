import mongoose from "mongoose";

const systemHealthLogSchema = new mongoose.Schema(
  {
    component: {
      type: String,
      required: true,
      enum: ["weekly_report", "email_delivery", "notification", "scheduler", "other"],
    },
    status: {
      type: String,
      enum: ["failed", "warning"],
      default: "failed",
    },
    errorMessage: {
      type: String,
      required: true,
    },
    errorStack: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

systemHealthLogSchema.index({ createdAt: -1 });
systemHealthLogSchema.index({ component: 1 });
systemHealthLogSchema.index({ status: 1 });

const SystemHealthLog = mongoose.model("SystemHealthLog", systemHealthLogSchema);

export default SystemHealthLog;
