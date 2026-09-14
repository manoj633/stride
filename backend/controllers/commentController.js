// src/controllers/commentController.js
import asyncHandler from "../middleware/asyncHandler.js";
import Comment from "../models/commentModel.js";
import logger from "../utils/logger.js";

/**
 * * Description: Create a new comment
 * * route: /api/comments
 * * access: Public
 */
const createComment = asyncHandler(async (req, res) => {
  logger.info("Creating new comment", {
    goalId: req.body.goalId,
    authorId: req.userId || req.body.authorId,
    endpoint: "/api/comments",
  });

  const { goalId, text, authorId } = req.body;

  const comment = new Comment({
    goalId,
    text,
    authorId: req.userId || authorId,
    date: new Date(),
  });

  const createdComment = await comment.save();
  const populatedComment = await Comment.findById(createdComment._id).populate(
    "authorId",
    "name email avatar"
  );

  logger.debug("Comment created successfully", {
    commentId: createdComment._id,
    goalId,
  });
  res.status(201).json(populatedComment);
});

/**
 * * Description: Get all comments for a goal
 * * route: /api/comments/goal/:goalId
 * * access: Public
 */
const getGoalComments = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  logger.info("Fetching comments for goal", {
    goalId,
    endpoint: "/api/comments/goal/:goalId",
  });

  const comments = await Comment.find({ goalId })
    .populate("authorId", "name email avatar")
    .sort({ date: -1 });

  logger.debug("Comments fetched successfully", {
    goalId,
    commentCount: comments.length,
  });
  res.json(comments);
});

/**
 * * Description: Update a comment
 * * route: /api/comments/:commentId
 * * access: Public
 */
const updateComment = asyncHandler(async (req, res) => {
  logger.info("Updating comment", {
    commentId: req.params.commentId,
    updates: req.body,
    endpoint: "/api/comments/:commentId",
  });

  const { commentId } = req.params;
  const { text } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    logger.error("Comment not found for update", { commentId });
    res.status(404);
    throw new Error("Comment not found");
  }

  if (!comment.authorId || !comment.authorId.equals(req.userId)) {
    logger.error("Not authorized to update comment", {
      commentId,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to update this comment");
  }

  comment.text = text;
  comment.date = new Date();
  const updatedComment = await comment.save();
  const populatedComment = await Comment.findById(
    updatedComment._id
  ).populate("authorId", "name email avatar");

  logger.debug("Comment updated successfully", {
    commentId,
    goalId: comment.goalId,
  });
  res.json(populatedComment);
});

/**
 * * Description: Delete a comment
 * * route: /api/comments/:commentId
 * * access: Public
 */
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  logger.info("Deleting comment", {
    commentId,
    endpoint: "/api/comments/:commentId",
  });

  const comment = await Comment.findById(commentId);

  if (!comment) {
    logger.error("Comment not found for deletion", { commentId });
    res.status(404);
    throw new Error("Comment not found");
  }

  if (!comment.authorId || !comment.authorId.equals(req.userId)) {
    logger.error("Not authorized to delete comment", {
      commentId,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  await Comment.deleteOne({ _id: commentId });
  logger.debug("Comment deleted successfully", {
    commentId,
    goalId: comment.goalId,
  });
  res.json({ message: "Comment removed" });
});

export { createComment, getGoalComments, updateComment, deleteComment };
