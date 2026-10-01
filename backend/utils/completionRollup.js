import Task from "../models/taskModel.js";
import Subtask from "../models/subtaskModel.js";
import Goal from "../models/goalModel.js";
import logger from "./logger.js";
import { handleTaskCompletionXP, handleGoalCompletionXP } from "./gamification.js";

/**
 * Recalculate completion percentage and completed status for a task based on its subtasks.
 * Cascades to update the parent goal if one exists.
 * @param {string|mongoose.Types.ObjectId} taskId
 */
export const updateTaskCompletionPercentage = async (taskId) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) return;

    const subtasks = await Subtask.find({ taskId });

    if (subtasks.length === 0) {
      const wasCompleted = task.completed;
      task.completionPercentage = 0;
      task.completed = false;
      if (wasCompleted) {
        task.completedAt = null;
      }
      await task.save();

      if (task.goalId) {
        await updateGoalCompletionPercentage(task.goalId);
      }
      return;
    }

    const completedSubtasks = subtasks.filter(
      (subtask) => subtask.completed
    ).length;
    const completionPercentage = (completedSubtasks / subtasks.length) * 100;
    const isCompleted = completedSubtasks === subtasks.length;
    const wasCompleted = task.completed;

    task.completionPercentage = Math.round(completionPercentage);
    task.completed = isCompleted;

    if (isCompleted && !wasCompleted) {
      task.completedAt = new Date();
    } else if (!isCompleted && wasCompleted) {
      task.completedAt = null;
    }

    const updatedTask = await task.save();

    if (updatedTask.completed && !wasCompleted) {
      await handleTaskCompletionXP(task.createdBy);
    }

    logger.debug("Updated task completion percentage", {
      taskId,
      completionPercentage: Math.round(completionPercentage),
      completed: isCompleted,
    });

    if (task.goalId) {
      await updateGoalCompletionPercentage(task.goalId);
    }
  } catch (error) {
    logger.error("Error updating task completion percentage", {
      taskId,
      error: error.message,
    });
  }
};

/**
 * Recalculate completion percentage and completed status for a goal based on its tasks.
 * @param {string|mongoose.Types.ObjectId} goalId
 */
export const updateGoalCompletionPercentage = async (goalId) => {
  try {
    const tasks = await Task.find({ goalId });
    const goal = await Goal.findById(goalId);

    if (!goal) return;

    if (tasks.length === 0) {
      const wasCompleted = goal.completed;
      goal.completionPercentage = 0;
      goal.completed = false;
      if (wasCompleted) {
        goal.completedAt = null;
      }
      await goal.save();
      return;
    }

    const totalPercentage = tasks.reduce(
      (sum, task) => sum + task.completionPercentage,
      0
    );
    const averagePercentage =
      tasks.length > 0 ? totalPercentage / tasks.length : 0;

    const completedTasks = tasks.filter((task) => task.completed).length;
    const isCompleted = tasks.length > 0 && completedTasks === tasks.length;
    const wasCompleted = goal.completed;

    goal.completionPercentage = Math.round(averagePercentage);
    goal.completed = isCompleted;

    if (isCompleted && !wasCompleted) {
      goal.completedAt = new Date();
    } else if (!isCompleted && wasCompleted) {
      goal.completedAt = null;
    }

    await goal.save();

    if (goal.completed && !wasCompleted) {
      await handleGoalCompletionXP(goal.createdBy);
    }

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
