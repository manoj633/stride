import mongoose from "mongoose";

const WeeklyReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    tasksCompleted: {
      type: Number,
      required: true,
      default: 0,
    },
    avgProgress: {
      type: Number,
      required: true,
      default: 0,
    },
    focusHours: {
      type: Number,
      required: true,
      default: 0,
    },
    consistencyRate: {
      type: Number,
      required: true,
      default: 0,
    },
    completedGoals: {
      type: Number,
      required: true,
      default: 0,
    },
    insights: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const WeeklyReport = mongoose.model("WeeklyReport", WeeklyReportSchema);
export default WeeklyReport;
