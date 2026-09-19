import mongoose from "mongoose";

const pomodoroSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 25,
      min: 1,
      max: 180,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for querying user sessions in date ranges efficiently
pomodoroSessionSchema.index({ user: 1, completedAt: 1 });

const PomodoroSession = mongoose.model("PomodoroSession", pomodoroSessionSchema);

export default PomodoroSession;
