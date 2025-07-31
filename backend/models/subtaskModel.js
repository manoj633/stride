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
      validate: {
        validator: function (value) {
          // Compare only the date part, ignore time
          const inputDate = new Date(value);
          const today = new Date();
          inputDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          return inputDate >= today;
        },
        message: "Due date cannot be in the past",
      },
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Subtask = mongoose.model("Subtask", SubtaskSchema);
export default Subtask;
