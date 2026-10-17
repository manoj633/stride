import mongoose from "mongoose";

const SubtaskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
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
    completedAt: {
      type: Date,
      default: null,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Indexes for cascade deletes, parent lookups, and user-scoped list queries (ESR sort)
SubtaskSchema.index({ taskId: 1 });
SubtaskSchema.index({ goalId: 1 });
SubtaskSchema.index({ createdBy: 1, taskId: 1 });
SubtaskSchema.index({ createdBy: 1, updatedAt: -1, createdAt: -1 });

const Subtask = mongoose.model("Subtask", SubtaskSchema);
export default Subtask;
