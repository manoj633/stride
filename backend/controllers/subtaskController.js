// src/controllers/subtaskController.js
import asyncHandler from "../middleware/asyncHandler.js";
import Subtask from "../models/subtaskModel.js";
import logger from "../utils/logger.js";

/**
 * * Description: Fetch all subtasks
 * * route: /api/subtasks
 * * access: Public
 */
const getSubtasks = asyncHandler(async (req, res) => {
  logger.info("Fetching all subtasks", { endpoint: "/api/subtasks" });
  const subtasks = await Subtask.find({});
  logger.debug("Subtasks fetched successfully", { count: subtasks.length });
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
    logger.debug("Subtask found successfully", { subtaskId: req.params.id });
    return res.json(subtask);
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

  if (subtask) {
    subtask.name = name || subtask.name;
    subtask.description = description || subtask.description;
    subtask.priority = priority || subtask.priority;
    subtask.dueDate = dueDate || subtask.dueDate;
    subtask.completed = completed !== undefined ? completed : subtask.completed;

    const updatedSubtask = await subtask.save();
    logger.debug("Subtask updated successfully", {
      subtaskId: updatedSubtask._id,
      taskId: updatedSubtask.taskId,
    });
    res.json(updatedSubtask);
  } else {
    logger.error("Subtask not found for update", { subtaskId: req.params.id });
    res.status(404);
    throw new Error("Subtask not found");
  }
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

  if (subtask) {
    await Subtask.deleteOne({ _id: req.params.id });
    logger.debug("Subtask deleted successfully", {
      subtaskId: req.params.id,
      taskId: subtask.taskId,
    });
    res.json({ message: "Subtask removed" });
  } else {
    logger.error("Subtask not found for deletion", {
      subtaskId: req.params.id,
    });
    res.status(404);
    throw new Error("Subtask not found");
  }
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

  if (subtask) {
    subtask.completed = true;
    const updatedSubtask = await subtask.save();
    logger.debug("Subtask marked as completed", {
      subtaskId: updatedSubtask._id,
      taskId: updatedSubtask.taskId,
    });
    res.json(updatedSubtask);
  } else {
    logger.error("Subtask not found for completion", {
      subtaskId: req.params.id,
    });
    res.status(404);
    throw new Error("Subtask not found");
  }
});

export {
  getSubtasks,
  getSubtaskById,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  markSubtaskAsCompleted,
};
