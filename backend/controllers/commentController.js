import asyncHandler from "../middleware/asyncHandler.js";
import Comment from "../models/commentModel.js";

/**
 * * Description: Create a new comment
 * * route: /api/comments
 * * access: Public
 */
const createComment = asyncHandler(async (req, res) => {
  const { goalId, text, authorId } = req.body;

  const comment = new Comment({
    goalId,
    text,
    authorId,
    date: new Date(),
  });

  const createdComment = await comment.save();

  const populatedComment = await Comment.findById(createdComment._id).populate(
    "authorId",
    "name email avatar"
  );

  res.status(201).json(populatedComment);
});

/**
 * * Description: Get all comments for a goal
 * * route: /api/comments/goal/:goalId
 * * access: Public
 */
const getGoalComments = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const comments = await Comment.find({ goalId })
    .populate("authorId", "name email avatar")
    .sort({ date: -1 });

  res.json(comments);
});

/**
 * * Description: Update a comment
 * * route: /api/comments/:commentId
 * * access: Public
 */
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  const comment = await Comment.findById(commentId);

  if (comment) {
    comment.text = text;
    comment.date = new Date();
    const updatedComment = await comment.save();

    const populatedComment = await Comment.findById(
      updatedComment._id
    ).populate("authorId", "name email avatar");

    res.json(populatedComment);
  } else {
    res.status(404);
    throw new Error("Comment not found");
  }
});

/**
 * * Description: Delete a comment
 * * route: /api/comments/:commentId
 * * access: Public
 */
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (comment) {
    await Comment.deleteOne({ _id: commentId });
    res.json({ message: "Comment removed" });
  } else {
    res.status(404);
    throw new Error("Comment not found");
  }
});

export { createComment, getGoalComments, updateComment, deleteComment };
