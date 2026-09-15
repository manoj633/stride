import asyncHandler from "../middleware/asyncHandler.js";
import Goal from "../models/goalModel.js";
import logger from "../utils/logger.js";
import Task from "../models/taskModel.js";
import Subtask from "../models/subtaskModel.js";
import Comment from "../models/commentModel.js";
import User from "../models/userModel.js";
import { getAICoachPrediction } from "../utils/aiCoach.js";

/**
 * * Description: Fetch all goals
 * * route: /api/goals
 * * access: Public
 */
const getGoals = asyncHandler(async (req, res) => {
  logger.info("Fetching all goals", { endpoint: "/api/goals" });
  const goals = await Goal.find({ createdBy: req.userId });
  logger.debug("Goals fetched successfully", { count: goals.length });
  res.json(goals);
});

/**
 * * Description: Fetch goal by id
 * * route: /api/goals/:id
 * * access: Public
 */
const getGoalById = asyncHandler(async (req, res) => {
  logger.info("Fetching goal by id", {
    goalId: req.params.id,
    endpoint: "/api/goals/:id",
  });

  const goal = await Goal.findById(req.params.id);
  if (goal) {
    logger.debug("Goal found successfully", { goalId: req.params.id });

    const isOwner = goal.createdBy && goal.createdBy.equals(req.userId);
    const isCollaborator =
      goal.collaborators &&
      goal.collaborators.some((c) =>
        c.equals ? c.equals(req.userId) : c.toString() === req.userId
      );

    if (isOwner || isCollaborator) {
      return res.json(goal);
    } else {
      res.status(404);
      throw new Error("Resource not found");
    }
  }

  logger.error("Goal not found", { goalId: req.params.id });
  res.status(404);
  throw new Error("Resource not found");
});

/**
 * * Description: Create a new goal
 * * route: /api/goals
 * * access: Public
 */
const createGoal = asyncHandler(async (req, res) => {
  logger.info("Creating new goal", {
    body: req.body,
    endpoint: "/api/goals",
  });

  const goal = new Goal({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    priority: req.body.priority,
    duration: req.body.duration,
    collaborators: req.body.collaborators,
    tags: req.body.tags,
    createdBy: req.userId,
  });

  const createdGoal = await goal.save();
  logger.debug("Goal created successfully", { goalId: createdGoal._id });
  res.status(201).json(createdGoal);
});

/**
 * * Description: Update a goal by id
 * * route: /api/goals/:id
 * * access: Public
 */
const updateGoal = asyncHandler(async (req, res) => {
  logger.info("Updating goal", {
    goalId: req.params.id,
    updates: req.body,
    endpoint: "/api/goals/:id",
  });

  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    logger.error("Goal not found for update", { goalId: req.params.id });
    res.status(404);
    throw new Error("Goal not found");
  }

  if (!goal.createdBy || !goal.createdBy.equals(req.userId)) {
    logger.error("Not authorized to update goal", {
      goalId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to update this goal");
  }

  Object.assign(goal, {
    title: req.body.title || goal.title,
    description: req.body.description || goal.description,
    category: req.body.category || goal.category,
    priority: req.body.priority || goal.priority,
    duration: req.body.duration || goal.duration,
    collaborators: req.body.collaborators || goal.collaborators,
    tags: req.body.tags || goal.tags,
    completionPercentage:
      typeof req.body.completionPercentage !== "undefined"
        ? req.body.completionPercentage
        : goal.completionPercentage,
    completed:
      typeof req.body.completed !== "undefined"
        ? req.body.completed
        : goal.completed,
  });

  const updatedGoal = await goal.save();
  logger.debug("Goal updated successfully", { goalId: updatedGoal._id });
  res.json(updatedGoal);
});

/**
 * * Description: Delete a goal by id
 * * route: /api/goals/:id
 * * access: Public
 */
const deleteGoal = asyncHandler(async (req, res) => {
  logger.info("Deleting goal", {
    goalId: req.params.id,
    endpoint: "/api/goals/:id",
  });

  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    logger.error("Goal not found for deletion", { goalId: req.params.id });
    res.status(404);
    throw new Error("Goal not found");
  }

  if (!goal.createdBy || !goal.createdBy.equals(req.userId)) {
    logger.error("Not authorized to delete goal", {
      goalId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to delete this goal");
  }

  const tasks = await Task.find({ goalId: req.params.id });

  // Get all task IDs for subtask deletion
  const taskIds = tasks.map((task) => task._id);

  // Count subtasks before deletion (fix for #11)
  let deletedSubtasksCount = 0;
  if (taskIds.length > 0) {
    deletedSubtasksCount = await Subtask.countDocuments({
      taskId: { $in: taskIds },
    });
    await Subtask.deleteMany({ taskId: { $in: taskIds } });
    logger.debug("Deleted subtasks for goal's tasks", {
      goalId: req.params.id,
      taskCount: taskIds.length,
      deletedSubtasksCount,
    });
  }

  // Delete all comments associated with this goal (fix for #15)
  const deletedComments = await Comment.deleteMany({ goalId: req.params.id });
  logger.debug("Deleted comments for goal", {
    goalId: req.params.id,
    deletedCommentsCount: deletedComments.deletedCount,
  });

  // Delete all tasks associated with this goal
  await Task.deleteMany({ goalId: req.params.id });
  logger.debug("Deleted tasks for goal", {
    goalId: req.params.id,
    taskCount: tasks.length,
  });

  await Goal.deleteOne({ _id: req.params.id });
  logger.debug("Goal deleted successfully", { goalId: req.params.id });
  res.json({
    message: "Goal and all related tasks, subtasks, and comments removed",
    deletedTasksCount: tasks.length,
    deletedSubtasksCount,
    deletedCommentsCount: deletedComments.deletedCount,
  });
});

/**
 * * Description: Partially update a goal's completion status or percentage
 * * route: /api/goals/:id/completion
 * * access: Public
 */
const updateGoalCompletion = asyncHandler(async (req, res) => {
  logger.info("Updating goal completion status", {
    goalId: req.params.id,
    updates: req.body,
    endpoint: "/api/goals/:id/completion",
  });

  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    logger.error("Goal not found for completion update", {
      goalId: req.params.id,
    });
    res.status(404);
    throw new Error("Goal not found");
  }

  if (!goal.createdBy || !goal.createdBy.equals(req.userId)) {
    logger.error("Not authorized to update goal completion", {
      goalId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to update this goal");
  }

  if (req.body.completed !== undefined) goal.completed = req.body.completed;
  if (req.body.completionPercentage !== undefined) {
    goal.completionPercentage = req.body.completionPercentage;
  }

  const updatedGoal = await goal.save();
  logger.debug("Goal completion updated successfully", {
    goalId: updatedGoal._id,
    completed: updatedGoal.completed,
    completionPercentage: updatedGoal.completionPercentage,
  });
  res.json(updatedGoal);
});

/**
 * * Description: Add collaborator to a goal
 * * route: /api/goals/:id/collaborators
 * * access: Public
 */
const addCollaborator = asyncHandler(async (req, res) => {
  logger.info("Adding collaborator to goal", {
    goalId: req.params.id,
    collaboratorId: req.body.collaboratorId,
    endpoint: "/api/goals/:id/collaborators",
  });

  const goal = await Goal.findById(req.params.id);
  const { collaboratorId } = req.body;

  if (!goal) {
    logger.error("Goal not found for adding collaborator", {
      goalId: req.params.id,
    });
    res.status(404);
    throw new Error("Goal not found");
  }

  if (!goal.createdBy || !goal.createdBy.equals(req.userId)) {
    logger.error("Not authorized to add collaborator to goal", {
      goalId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to update this goal");
  }

  const alreadyAdded = goal.collaborators.some(
    (c) => (c.equals ? c.equals(collaboratorId) : c.toString() === collaboratorId)
  );

  if (!alreadyAdded) {
    goal.collaborators.push(collaboratorId);
    const updatedGoal = await goal.save();
    logger.debug("Collaborator added successfully", {
      goalId: goal._id,
      collaboratorId,
    });
    return res.json(updatedGoal);
  } else {
    logger.warn("Collaborator already exists", {
      goalId: goal._id,
      collaboratorId,
    });
    res.status(400);
    throw new Error("Collaborator already added");
  }
});

/**
 * * Description: Remove collaborator from a goal
 * * route: /api/goals/:id/collaborators
 * * access: Public
 */
const removeCollaborator = asyncHandler(async (req, res) => {
  logger.info("Removing collaborator from goal", {
    goalId: req.params.id,
    collaboratorId: req.body.collaboratorId,
    endpoint: "/api/goals/:id/collaborators",
  });

  const goal = await Goal.findById(req.params.id);
  const { collaboratorId } = req.body;

  if (!goal) {
    logger.error("Goal not found for removing collaborator", {
      goalId: req.params.id,
    });
    res.status(404);
    throw new Error("Goal not found");
  }

  if (!goal.createdBy || !goal.createdBy.equals(req.userId)) {
    logger.error("Not authorized to remove collaborator from goal", {
      goalId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to update this goal");
  }

  goal.collaborators = goal.collaborators.filter(
    (collaborator) => collaborator.toString() !== collaboratorId
  );
  const updatedGoal = await goal.save();
  logger.debug("Collaborator removed successfully", {
    goalId: goal._id,
    collaboratorId,
  });
  res.json(updatedGoal);
});

/**
 * * Description: Add a tag to a goal
 * * route: /api/goals/:id/tags
 * * access: Public
 */
const addTag = asyncHandler(async (req, res) => {
  logger.info("Adding tag to goal", {
    goalId: req.params.id,
    tagId: req.body.tagId,
    endpoint: "/api/goals/:id/tags",
  });

  const goal = await Goal.findById(req.params.id);
  const { tagId } = req.body;

  if (!goal) {
    logger.error("Goal not found for adding tag", { goalId: req.params.id });
    res.status(404);
    throw new Error("Goal not found");
  }

  if (!goal.createdBy || !goal.createdBy.equals(req.userId)) {
    logger.error("Not authorized to add tag to goal", {
      goalId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to update this goal");
  }

  const alreadyTagged = goal.tags.some(
    (t) => (t.equals ? t.equals(tagId) : t.toString() === tagId)
  );

  if (!alreadyTagged) {
    goal.tags.push(tagId);
    const updatedGoal = await goal.save();
    logger.debug("Tag added successfully", { goalId: goal._id, tagId });
    return res.json(updatedGoal);
  } else {
    logger.warn("Tag already exists", { goalId: goal._id, tagId });
    res.status(400);
    throw new Error("Tag already added");
  }
});

/**
 * * Description: Remove a tag from a goal
 * * route: /api/goals/:id/tags
 * * access: Public
 */
const removeTag = asyncHandler(async (req, res) => {
  logger.info("Removing tag from goal", {
    goalId: req.params.id,
    tagId: req.body.tagId,
    endpoint: "/api/goals/:id/tags",
  });

  const goal = await Goal.findById(req.params.id);
  const { tagId } = req.body;

  if (!goal) {
    logger.error("Goal not found for removing tag", { goalId: req.params.id });
    res.status(404);
    throw new Error("Goal not found");
  }

  if (!goal.createdBy || !goal.createdBy.equals(req.userId)) {
    logger.error("Not authorized to remove tag from goal", {
      goalId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to update this goal");
  }

  goal.tags = goal.tags.filter((tag) => tag.toString() !== tagId);
  const updatedGoal = await goal.save();
  logger.debug("Tag removed successfully", { goalId: goal._id, tagId });
  res.json(updatedGoal);
});

/**
 * * Description: Add a comment to a goal
 * * route: /api/goals/:id/comments
 * * access: Public
 */
const addComment = asyncHandler(async (req, res) => {
  logger.info("Adding comment to goal", {
    goalId: req.params.id,
    commentId: req.body.commentId,
    endpoint: "/api/goals/:id/comments",
  });

  const goal = await Goal.findById(req.params.id);
  const { commentId } = req.body;

  if (goal) {
    goal.comments.push(commentId);
    const updatedGoal = await goal.save();
    logger.debug("Comment added successfully", { goalId: goal._id, commentId });
    return res.json(updatedGoal);
  } else {
    logger.error("Goal not found for adding comment", {
      goalId: req.params.id,
    });
    res.status(404);
    throw new Error("Goal not found");
  }
});

/**
 * * Description: Remove a comment from a goal
 * * route: /api/goals/:id/comments
 * * access: Public
 */
const removeComment = asyncHandler(async (req, res) => {
  logger.info("Removing comment from goal", {
    goalId: req.params.id,
    commentId: req.body.commentId,
    endpoint: "/api/goals/:id/comments",
  });

  const goal = await Goal.findById(req.params.id);
  const { commentId } = req.body;

  if (goal) {
    goal.comments = goal.comments.filter(
      (comment) => comment.toString() !== commentId
    );
    const updatedGoal = await goal.save();
    logger.debug("Comment removed successfully", {
      goalId: goal._id,
      commentId,
    });
    res.json(updatedGoal);
  } else {
    logger.error("Goal not found for removing comment", {
      goalId: req.params.id,
    });
    res.status(404);
    throw new Error("Goal not found");
  }
});

/**
 * * Description: Update a goal status to complete
 * * route: /api/goals/:id/status
 * * access: Public
 */
const updateGoalStatus = asyncHandler(async (req, res) => {
  logger.info("Updating goal status", {
    goalId: req.params.id,
    updates: req.body,
    endpoint: "/api/goals/:id/status",
  });

  try {
    const { id } = req.params;
    const { completed, completionPercentage } = req.body;

    const goal = await Goal.findById(id);

    if (!goal) {
      logger.error("Goal not found for status update", { goalId: id });
      return res.status(404).json({ message: "Goal not found" });
    }

    if (!goal.createdBy || !goal.createdBy.equals(req.userId)) {
      logger.error("Not authorized to update goal status", {
        goalId: id,
        userId: req.userId,
      });
      return res
        .status(403)
        .json({ message: "Not authorized to update this goal status" });
    }

    goal.completed = completed || false;
    goal.completionPercentage = completionPercentage || 0;

    const updatedGoal = await goal.save();

    logger.debug("Goal status updated successfully", {
      goalId: id,
      completed: updatedGoal.completed,
      completionPercentage: updatedGoal.completionPercentage,
    });
    res.json(updatedGoal);
  } catch (error) {
    logger.error("Error updating goal status", {
      goalId: req.params.id,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Error updating goal status",
      error: error.message,
    });
  }
});

/**
 * * Description: Archive a goal
 * * route: /api/goals//:id/archive
 * * access: Public
 */
// src/controllers/goalController.js
const archiveGoal = asyncHandler(async (req, res) => {
  logger.info("Archiving goal", {
    goalId: req.params.id,
    endpoint: "/api/goals/:id/archive",
  });

  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    logger.error("Goal not found for archiving", { goalId: req.params.id });
    res.status(404);
    throw new Error("Goal not found");
  }

  if (!goal.createdBy || !goal.createdBy.equals(req.userId)) {
    logger.error("Not authorized to archive goal", {
      goalId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to archive this goal");
  }

  goal.archived = true;
  const updatedGoal = await goal.save();
  logger.debug("Goal archived successfully", { goalId: updatedGoal._id });
  res.json(updatedGoal);
});

// @desc    Get goal completion prediction and AI coach assessment
// @route   GET /api/goals/:id/prediction
// @access  Private
const getGoalPrediction = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (!goal) {
    res.status(404);
    throw new Error("Goal not found");
  }

  const isOwner = goal.createdBy && goal.createdBy.equals(req.userId);
  const isCollaborator =
    goal.collaborators &&
    goal.collaborators.some((c) =>
      c.equals ? c.equals(req.userId) : c.toString() === req.userId
    );

  // Ensure owner or collaborator
  if (!isOwner && !isCollaborator) {
    res.status(403);
    throw new Error("Not authorized to access this goal prediction");
  }

  const tasks = await Task.find({ goalId: goal._id });
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const remainingTasksCount = tasks.length - completedTasksCount;

  const now = new Date();
  const startDate = new Date(goal.duration.startDate);
  const endDate = new Date(goal.duration.endDate);

  const daysElapsed = Math.max(1, Math.round((now - startDate) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.round((endDate - now) / (1000 * 60 * 60 * 24)));

  // Calculate local velocity (tasks completed per day on this goal)
  const localVelocity = completedTasksCount / daysElapsed;

  // Calculate global velocity (tasks completed per day globally for the user)
  const user = await User.findById(req.userId);
  const daysSinceAccountCreated = Math.max(1, Math.round((now - user.createdAt) / (1000 * 60 * 60 * 24)));
  const globalVelocity = (user.totalTasksCompleted || 0) / daysSinceAccountCreated;

  // Blend local and global velocity to resolve cold starts
  const blendedVelocity = completedTasksCount > 0 ? localVelocity : Math.max(0.2, globalVelocity || 0.2);

  // Days needed to finish remaining tasks
  const daysNeeded = blendedVelocity > 0 ? remainingTasksCount / blendedVelocity : remainingTasksCount;

  // Status calculation
  let status = "neutral";
  let onTrack = true;

  if (tasks.length === 0) {
    status = "neutral";
    onTrack = true;
  } else if (goal.completed || goal.completionPercentage === 100) {
    status = "completed";
    onTrack = true;
  } else if (daysRemaining <= 0) {
    status = "overdue";
    onTrack = false;
  } else if (daysNeeded <= daysRemaining) {
    status = "on-track";
    onTrack = true;
  } else {
    status = "at-risk";
    onTrack = false;
  }

  // Get AI Coach assessment text
  const aiCoachAssessment = await getAICoachPrediction(
    goal.title,
    goal.description,
    completedTasksCount,
    tasks.length,
    daysRemaining,
    daysNeeded,
    status,
    { userId: req.userId, goalId: goal._id }
  );

  res.json({
    onTrack,
    completionVelocity: blendedVelocity,
    daysRemaining,
    daysNeeded,
    status,
    aiCoachAssessment,
    totalTasks: tasks.length,
    completedTasks: completedTasksCount,
    remainingTasks: remainingTasksCount,
  });
});

export {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalCompletion,
  addCollaborator,
  removeCollaborator,
  addTag,
  removeTag,
  addComment,
  removeComment,
  updateGoalStatus,
  archiveGoal,
  getGoalPrediction,
};
