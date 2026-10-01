// src/controllers/subtaskController.js
import asyncHandler from "../middleware/asyncHandler.js";
import Subtask from "../models/subtaskModel.js";
import logger from "../utils/logger.js";
import { handleSubtaskCompletionXP } from "../utils/gamification.js";
import { updateTaskCompletionPercentage } from "../utils/completionRollup.js";

/**
 * * Description: Fetch all subtasks
 * * route: /api/subtasks
 * * access: Public
 */
const getSubtasks = asyncHandler(async (req, res) => {
  const { year, taskId, goalId } = req.query;
  logger.info("Fetching subtasks", { endpoint: "/api/subtasks", year, taskId, goalId });

  const query = { createdBy: req.userId };

  if (taskId) {
    query.taskId = taskId;
  }
  if (goalId) {
    query.goalId = goalId;
  }

  if (year && year !== "all") {
    const y = parseInt(year, 10);
    if (!isNaN(y)) {
      const startOfYear = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
      const endOfYear = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
      query.$or = [
        {
          dueDate: { $gte: startOfYear, $lte: endOfYear },
        },
        {
          $or: [
            { dueDate: { $exists: false } },
            { dueDate: null },
          ],
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      ];
    }
  }

  const subtasks = await Subtask.find(query);
  logger.debug("Subtasks fetched successfully", {
    count: subtasks.length,
  });
  res.json(subtasks);
});

/**
 * * Description: Fetch subtask by id
 * * route: /api/subtasks/:id
 * * access: Public
 */
const getSubtaskById = asyncHandler(async (req, res) => {
  logger.info("Fetching subtask by id", {
    subtaskId: req.params.id,
    endpoint: "/api/subtasks/:id",
  });

  const subtask = await Subtask.findById(req.params.id);
  if (subtask) {
    if (subtask.createdBy.equals(req.userId)) {
      logger.debug("Subtask found successfully", { subtaskId: req.params.id });
      return res.json(subtask);
    } else {
      logger.error("Subtask not found", { subtaskId: req.params.id });
      res.status(404);
      throw new Error("Resource not found");
    }
  }
  logger.error("Subtask not found", { subtaskId: req.params.id });
  res.status(404);
  throw new Error("Resource not found");
});

/**
 * * Description: Create a new subtask
 * * route: /api/subtasks
 * * access: Public
 */
const createSubtask = asyncHandler(async (req, res) => {
  logger.info("Creating new subtask", {
    body: req.body,
    endpoint: "/api/subtasks",
  });

  const { name, description, priority, dueDate, taskId, goalId } = req.body;
  const subtask = new Subtask({
    name,
    description,
    priority,
    dueDate,
    taskId,
    goalId,
    createdBy: req.userId,
  });

  const createdSubtask = await subtask.save();
  logger.debug("Subtask created successfully", {
    subtaskId: createdSubtask._id,
    taskId,
    goalId,
  });
  res.status(201).json(createdSubtask);
});

/**
 * * Description: Update a subtask
 * * route: /api/subtasks/:id
 * * access: Public
 */
const updateSubtask = asyncHandler(async (req, res) => {
  logger.info("Updating subtask", {
    subtaskId: req.params.id,
    updates: req.body,
    endpoint: "/api/subtasks/:id",
  });

  const { name, description, priority, dueDate, completed } = req.body;
  const subtask = await Subtask.findById(req.params.id);

  if (!subtask) {
    logger.error("Subtask not found for update", { subtaskId: req.params.id });
    res.status(404);
    throw new Error("Subtask not found");
  }

  if (!subtask.createdBy || !subtask.createdBy.equals(req.userId)) {
    logger.error("Not authorized to update subtask", {
      subtaskId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to update this subtask");
  }

  const wasCompleted = subtask.completed;
  subtask.name = name || subtask.name;
  subtask.description = description || subtask.description;
  subtask.priority = priority || subtask.priority;
  subtask.dueDate = dueDate || subtask.dueDate;
  if (completed !== undefined) {
    subtask.completed = completed;
    if (subtask.completed && !wasCompleted) {
      subtask.completedAt = new Date();
    } else if (!subtask.completed && wasCompleted) {
      subtask.completedAt = null;
    }
  }

  const updatedSubtask = await subtask.save();
  logger.debug("Subtask updated successfully", {
    subtaskId: updatedSubtask._id,
    taskId: updatedSubtask.taskId,
  });

  if (updatedSubtask.completed && !wasCompleted) {
    await handleSubtaskCompletionXP(req.userId);
  }

  if (updatedSubtask.taskId) {
    await updateTaskCompletionPercentage(updatedSubtask.taskId);
  }

  res.json(updatedSubtask);
});

/**
 * * Description: Delete a subtask
 * * route: /api/subtasks/:id
 * * access: Public
 */
const deleteSubtask = asyncHandler(async (req, res) => {
  logger.info("Deleting subtask", {
    subtaskId: req.params.id,
    endpoint: "/api/subtasks/:id",
  });

  const subtask = await Subtask.findById(req.params.id);

  if (!subtask) {
    logger.error("Subtask not found for deletion", {
      subtaskId: req.params.id,
    });
    res.status(404);
    throw new Error("Subtask not found");
  }

  if (!subtask.createdBy || !subtask.createdBy.equals(req.userId)) {
    logger.error("Not authorized to delete subtask", {
      subtaskId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to delete this subtask");
  }

  const taskId = subtask.taskId;

  await Subtask.deleteOne({ _id: req.params.id });
  logger.debug("Subtask deleted successfully", {
    subtaskId: req.params.id,
    taskId: subtask.taskId,
  });

  // Update the completion percentage of the parent task
  if (taskId) {
    await updateTaskCompletionPercentage(taskId);
  }

  res.json({
    message: "Subtask removed",
    taskId: subtask.taskId,
    goalId: subtask.goalId,
  });
});

/**
 * * Description: Mark subtask as completed
 * * route: /api/subtasks/:id/complete
 * * access: Public
 */
const markSubtaskAsCompleted = asyncHandler(async (req, res) => {
  logger.info("Marking subtask as completed", {
    subtaskId: req.params.id,
    endpoint: "/api/subtasks/:id/complete",
  });

  const subtask = await Subtask.findById(req.params.id);

  if (!subtask) {
    logger.error("Subtask not found for completion", {
      subtaskId: req.params.id,
    });
    res.status(404);
    throw new Error("Subtask not found");
  }

  if (!subtask.createdBy || !subtask.createdBy.equals(req.userId)) {
    logger.error("Not authorized to mark subtask as completed", {
      subtaskId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to update this subtask");
  }

  const wasCompleted = subtask.completed;
  subtask.completed = true;
  if (!wasCompleted) {
    subtask.completedAt = new Date();
  }
  const updatedSubtask = await subtask.save();
  logger.debug("Subtask marked as completed", {
    subtaskId: updatedSubtask._id,
    taskId: updatedSubtask.taskId,
  });

  if (updatedSubtask.completed && !wasCompleted) {
    await handleSubtaskCompletionXP(req.userId);
  }

  if (updatedSubtask.taskId) {
    await updateTaskCompletionPercentage(updatedSubtask.taskId);
  }

  res.json(updatedSubtask);
});

export {
  getSubtasks,
  getSubtaskById,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  markSubtaskAsCompleted,
};
