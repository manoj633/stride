import express from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskCompletion,
} from "../controllers/taskController.js";

const router = express.Router();

// Get all tasks, create a new task
router.route("/").get(getTasks).post(createTask);

// Get, update, or delete task by id
router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);

// Partially update task completion
router.route("/:id/completion").put(updateTaskCompletion);

export default router;
