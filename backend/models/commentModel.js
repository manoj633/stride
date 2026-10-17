import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for goal comment fetching, author queries, and cascade deletes
CommentSchema.index({ goalId: 1 });
CommentSchema.index({ authorId: 1 });

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
