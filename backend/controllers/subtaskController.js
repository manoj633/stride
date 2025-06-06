// src/controllers/subtaskController.js
import asyncHandler from "../middleware/asyncHandler.js";
import Subtask from "../models/subtaskModel.js";
import logger from "../utils/logger.js";
import Task from "../models/taskModel.js";

/**
 * * Description: Fetch all subtasks
 * * route: /api/subtasks
 * * access: Public
 */
const getSubtasks = asyncHandler(async (req, res) => {
  logger.info("Fetching all subtasks", { endpoint: "/api/subtasks" });
  const subtasks = await Subtask.find({ createdBy: req.userId });
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
    console.log(
      subtask.createdBy,
      req.userId,
      !subtask.createdBy.equals(req.userId)
    );
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

// Helper function to update task completion percentage
const updateTaskCompletionPercentage = async (taskId) => {
  try {
    // Find all subtasks for this task
    const subtasks = await Subtask.find({ taskId });

    if (subtasks.length === 0) {
      // If no subtasks left, set completion to 0
      const task = await Task.findByIdAndUpdate(
        taskId,
        {
          completionPercentage: 0,
          completed: false,
        },
        { new: true }
      );

      // Also update the parent goal
      if (task && task.goalId) {
        await updateGoalCompletionPercentage(task.goalId);
      }
      return;
    }

    // Calculate completion percentage based on completed subtasks
    const completedSubtasks = subtasks.filter(
      (subtask) => subtask.completed
    ).length;
    const completionPercentage = (completedSubtasks / subtasks.length) * 100;
    const isCompleted = completedSubtasks === subtasks.length;

    // Update the task
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        completionPercentage: Math.round(completionPercentage),
        completed: isCompleted,
      },
      { new: true }
    );

    logger.debug("Updated task completion percentage", {
      taskId,
      completionPercentage: Math.round(completionPercentage),
      completed: isCompleted,
    });

    // Also update the parent goal
    if (task && task.goalId) {
      await updateGoalCompletionPercentage(task.goalId);
    }
  } catch (error) {
    logger.error("Error updating task completion percentage", {
      taskId,
      error: error.message,
    });
  }
};
// Import the same goal update function from above
const updateGoalCompletionPercentage = async (goalId) => {
  try {
    // Find all tasks for this goal
    const tasks = await Task.find({ goalId });

    if (tasks.length === 0) {
      // If no tasks left, set completion to 0
      await Goal.findByIdAndUpdate(goalId, {
        completionPercentage: 0,
        completed: false,
      });
      return;
    }
    // Calculate the average completion percentage
    const totalPercentage = tasks.reduce(
      (sum, task) => sum + task.completionPercentage,
      0
    );
    const averagePercentage =
      tasks.length > 0 ? totalPercentage / tasks.length : 0;

    // Count completed tasks
    const completedTasks = tasks.filter((task) => task.completed).length;
    const isCompleted = tasks.length > 0 && completedTasks === tasks.length;

    // Update the goal
    await Goal.findByIdAndUpdate(goalId, {
      completionPercentage: Math.round(averagePercentage),
      completed: isCompleted,
    });

    logger.debug("Updated goal completion percentage", {
      goalId,
      completionPercentage: Math.round(averagePercentage),
      completed: isCompleted,
    });
  } catch (error) {
    logger.error("Error updating goal completion percentage", {
      goalId,
      error: error.message,
    });
  }
};

export {
  getSubtasks,
  getSubtaskById,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  markSubtaskAsCompleted,
};
