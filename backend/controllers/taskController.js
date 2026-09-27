// src/controllers/taskController.js
import asyncHandler from "../middleware/asyncHandler.js";
import Task from "../models/taskModel.js";
import logger from "../utils/logger.js";
import Subtask from "../models/subtaskModel.js";
import Goal from "../models/goalModel.js";
import { handleTaskCompletionXP } from "../utils/gamification.js";
import { updateGoalCompletionPercentage } from "../utils/completionRollup.js";

/**
 * * Description: Fetch all tasks
 * * route: /api/tasks
 * * access: Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const { year } = req.query;
  logger.info("Fetching tasks", { endpoint: "/api/tasks", year });

  const query = { createdBy: req.userId };

  if (year && year !== "all") {
    const y = parseInt(year, 10);
    if (!isNaN(y)) {
      const startOfYear = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
      const endOfYear = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
      query.$or = [
        {
          startDate: { $lte: endOfYear },
          endDate: { $gte: startOfYear },
        },
        {
          $or: [
            { startDate: { $exists: false } },
            { endDate: { $exists: false } },
          ],
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      ];
    }
  }

  const tasks = await Task.find(query);
  logger.debug("Tasks fetched successfully", { count: tasks.length });
  res.json(tasks);
});

/**
 * * Description: Fetch task by id
 * * route: /api/tasks/:id
 * * access: Private
 */
const getTaskById = asyncHandler(async (req, res) => {
  logger.info("Fetching task by id", {
    taskId: req.originalUrl,
    endpoint: "/api/tasks/:id",
  });

  const task = await Task.findById(req.params.id);
  if (task) {
    if (task.createdBy && task.createdBy.equals(req.userId)) {
      logger.debug("Task found successfully", { taskId: req.params.id });
      return res.json(task);
    } else {
      logger.error("Task not found", { taskId: req.params.id });
      res.status(404);
      throw new Error("Resource not found");
    }
  }

  logger.error("Task not found", { taskId: req.params.id });
  res.status(404);
  throw new Error("Resource not found");
});

/**
 * * Description: Create a new task
 * * route: /api/tasks
 * * access: Private
 */
const createTask = asyncHandler(async (req, res) => {
  console.log("DEBUG: createTask received body:", req.body);
  logger.info("Creating new task", {
    body: req.body,
    endpoint: "/api/tasks",
  });

  const {
    name,
    description,
    priority,
    startDate,
    endDate,
    goalId,
    completionPercentage,
  } = req.body;

  const task = new Task({
    name,
    description,
    priority,
    startDate,
    endDate,
    goalId,
    completionPercentage,
    createdBy: req.userId,
  });

  const createdTask = await task.save();
  logger.debug("Task created successfully", { taskId: createdTask._id });
  
  if (createdTask.goalId) {
    await updateGoalCompletionPercentage(createdTask.goalId);
  }
  
  res.status(201).json(createdTask);
});

/**
 * * Description: Update an existing task
 * * route: /api/tasks/:id
 * * access: Private
 */
const updateTask = asyncHandler(async (req, res) => {
  logger.info("Updating task", {
    taskId: req.params.id,
    updates: req.body,
    endpoint: "/api/tasks/:id",
  });

  const {
    name,
    description,
    priority,
    startDate,
    endDate,
    goalId,
    completionPercentage,
    completed,
  } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    logger.error("Task not found for update", { taskId: req.params.id });
    res.status(404);
    throw new Error("Task not found");
  }

  if (!task.createdBy || !task.createdBy.equals(req.userId)) {
    logger.error("Not authorized to update task", {
      taskId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to update this task");
  }

  const wasCompleted = task.completed;
  task.name = name || task.name;
  task.description = description || task.description;
  task.priority = priority || task.priority;
  task.startDate = startDate || task.startDate;
  task.endDate = endDate || task.endDate;
  task.goalId = goalId || task.goalId;
  task.completionPercentage =
    completionPercentage ?? task.completionPercentage;
  if (completed !== undefined) {
    task.completed = completed;
    if (task.completed && !wasCompleted) {
      task.completedAt = new Date();
    } else if (!task.completed && wasCompleted) {
      task.completedAt = null;
    }
  }

  const updatedTask = await task.save();
  logger.debug("Task updated successfully", { taskId: updatedTask._id });
  
  if (updatedTask.completed && !wasCompleted) {
    await handleTaskCompletionXP(req.userId);
  }

  if (updatedTask.goalId) {
    await updateGoalCompletionPercentage(updatedTask.goalId);
  }
  
  res.json(updatedTask);
});

/**
 * * Description: Delete a task by id
 * * route: /api/tasks/:id
 * * access: Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  logger.info("Deleting task", {
    taskId: req.params.id,
    endpoint: "/api/tasks/:id",
  });

  const task = await Task.findById(req.params.id);

  if (!task) {
    logger.error("Task not found for deletion", { taskId: req.params.id });
    res.status(404);
    throw new Error("Task not found");
  }

  if (!task.createdBy || !task.createdBy.equals(req.userId)) {
    logger.error("Not authorized to delete task", {
      taskId: req.params.id,
      userId: req.userId,
    });
    res.status(403);
    throw new Error("Not authorized to delete this task");
  }

  // Delete all subtasks associated with this task
  await Subtask.deleteMany({ taskId: req.params.id });
  logger.debug("Deleted subtasks for task", { taskId: req.params.id });

  // Delete the task itself
  await Task.deleteOne({ _id: req.params.id });
  logger.debug("Task deleted successfully", { taskId: req.params.id });

  // Update the completion percentage of the parent goal
  if (task.goalId) {
    await updateGoalCompletionPercentage(task.goalId);
  }

  res.json({
    message: "Task and all related subtasks removed",
    goalId: task.goalId,
  });
});

/**
 * * Description: Partially update a task's completion status or completion percentage
 * * route: /api/tasks/:id/completion
 * * access: Private
 */
const updateTaskCompletion = asyncHandler(async (req, res) => {
  logger.info("Updating task completion status", {
    taskId: req.params.id,
    updates: req.body,
    endpoint: "/api/tasks/:id/completion",
  });

  const { completed, completionPercentage } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      logger.error("Task not found for completion update", {
        taskId: req.params.id,
      });
      res.status(404);
      throw new Error("Task not found");
    }

    if (!task.createdBy || !task.createdBy.equals(req.userId)) {
      logger.error("Not authorized to update task completion", {
        taskId: req.params.id,
        userId: req.userId,
      });
      res.status(403);
      throw new Error("Not authorized to update this task");
    }

    const wasCompleted = task.completed;
    if (completed !== undefined) {
      task.completed = completed;
      if (task.completed && !wasCompleted) {
        task.completedAt = new Date();
      } else if (!task.completed && wasCompleted) {
        task.completedAt = null;
      }
    }
    if (completionPercentage !== undefined) {
      if (completionPercentage < 0 || completionPercentage > 100) {
        logger.warn("Invalid completion percentage", {
          taskId: req.params.id,
          completionPercentage,
        });
        res.status(400);
        throw new Error("Completion percentage must be between 0 and 100");
      }
      task.completionPercentage = completionPercentage;
    }

    const updatedTask = await task.save();
    logger.debug("Task completion updated successfully", {
      taskId: updatedTask._id,
      completed: updatedTask.completed,
      completionPercentage: updatedTask.completionPercentage,
    });
    
    if (updatedTask.completed && !wasCompleted) {
      await handleTaskCompletionXP(req.userId);
    }

    if (updatedTask.goalId) {
      await updateGoalCompletionPercentage(updatedTask.goalId);
    }
    
    res.json(updatedTask);
  } catch (error) {
    logger.error("Error updating task completion", {
      taskId: req.params.id,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
});

export {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskCompletion,
};
