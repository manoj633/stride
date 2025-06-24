import mongoose from "mongoose";

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 2, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  completed: { type: Boolean, default: false },
});

const GoalTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: { type: String, trim: true, maxlength: 500 },
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
    duration: {
      startDate: { type: Date },
      endDate: {
        type: Date,
        validate: {
          validator: function (value) {
            if (!this.duration.startDate || !value) return true;
            return value > this.duration.startDate;
          },
          message: "End date must be after start date",
        },
      },
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    subtasks: [SubtaskSchema],
    isPublic: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const GoalTemplate = mongoose.model("GoalTemplate", GoalTemplateSchema);
export default GoalTemplate;
