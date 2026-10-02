import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    title: {
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
    category: {
      type: String,
      enum: [
        "Education",
        "Health",
        "Leisure",
        "Fitness",
        "Career",
        "Work",
        "Personal",
        "Other",
      ],
      default: "Other",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    duration: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
        validate: {
          validator: function (value) {
            if (!this.duration.startDate || !value) return true;
            return value > this.duration.startDate;
          },
          message: "End date must be after start date",
        },
      },
    },
    archived: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    aiPredictionCache: {
      assessment: {
        type: String,
        default: null,
      },
      lastGeneratedAt: {
        type: Date,
        default: null,
      },
      status: {
        type: String,
        default: null,
      },
      completedTasksCount: {
        type: Number,
        default: 0,
      },
      totalTasksCount: {
        type: Number,
        default: 0,
      },
      daysRemaining: {
        type: Number,
        default: 0,
      },
      daysNeeded: {
        type: Number,
        default: 0,
      },
      completionVelocity: {
        type: Number,
        default: 0,
      },
      onTrack: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", GoalSchema);
export default Goal;
