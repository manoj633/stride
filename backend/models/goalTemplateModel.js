import mongoose from "mongoose";

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
});

const GoalTemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
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
      endDate: { type: Date },
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
