import asyncHandler from "../middleware/asyncHandler.js";
import Comment from "../models/commentModel.js";
import User from "../models/userModel.js";
import logger from "../utils/logger.js";
import logAdminAction from "../utils/auditLogger.js";

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
 * * Description: Get all platform comments for admin moderation
 * * route: /api/comments/admin/all
 * * access: Private/Admin
 */
const adminGetComments = asyncHandler(async (req, res) => {
  const pageSize = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const search = req.query.search ? req.query.search.trim() : "";

  let filter = {};
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter = { text: { $regex: escapedSearch, $options: "i" } };
  }

  const totalComments = await Comment.countDocuments(filter);
  const comments = await Comment.find(filter)
    .populate("authorId", "name email")
    .populate("goalId", "title")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    comments,
    page,
    pages: Math.ceil(totalComments / pageSize) || 1,
    totalComments,
  });
});

/**
 * * Description: Delete a comment (supports author or admin moderation)
 * * route: /api/comments/:commentId
 * * access: Private
 */
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  logger.info("Deleting comment", {
    commentId,
    endpoint: "/api/comments/:commentId",
  });

  const comment = await Comment.findById(commentId)
    .populate("authorId", "name email")
    .populate("goalId", "title");

  if (!comment) {
    logger.error("Comment not found for deletion", { commentId });
    res.status(404);
    throw new Error("Comment not found");
  }

  // Determine if requester is an admin
  let isAdmin = Boolean(req.user?.isAdmin);
  if (!isAdmin && req.userId) {
    const requestingUser = await User.findById(req.userId).select("isAdmin");
    if (requestingUser?.isAdmin) {
      isAdmin = true;
    }
  }

  const isAuthor =
    comment.authorId &&
    (comment.authorId._id
      ? comment.authorId._id.equals(req.userId)
      : comment.authorId.equals(req.userId));

  if (!isAuthor && !isAdmin) {
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

  // If deleted by an admin on behalf of moderation, audit the action
  if (isAdmin) {
    await logAdminAction({
      req,
      action: "COMMENT_DELETE",
      targetType: "Comment",
      targetId: comment._id,
      targetIdentifier: comment.text ? comment.text.substring(0, 50) : "Comment",
      details: {
        author: comment.authorId
          ? `${comment.authorId.name} (${comment.authorId.email})`
          : "Unknown",
        goalTitle: comment.goalId ? comment.goalId.title : "Unknown",
        isAuthorDelete: Boolean(isAuthor),
      },
    });
  }

  res.json({ message: "Comment removed" });
});

export {
  createComment,
  getGoalComments,
  updateComment,
  deleteComment,
  adminGetComments,
};
