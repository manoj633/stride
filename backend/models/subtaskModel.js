import mongoose from "mongoose";

const SubtaskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
    },
  },
  { timestamps: true }
);

const Subtask = mongoose.model("Subtask", SubtaskSchema);
export default Subtask;
