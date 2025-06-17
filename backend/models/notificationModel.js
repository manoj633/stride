import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["goal-reminder", "other"],
      default: "goal-reminder",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
