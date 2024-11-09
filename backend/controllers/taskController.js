import asyncHandler from "../middleware/asyncHandler.js";
import Task from "../models/taskModel.js";

/**
 * * Description: Fetch all tasks
 * * route: /api/tasks
 * * access: Public
 */
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({});
  res.json(tasks);
});

/**
 * * Description: Fetch task by id
 * * route: /api/tasks/:id
 * * access: Public
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (task) {
    return res.json(task);
  }

  res.status(404);
  throw new Error("Resource not found");
});

export { getTasks, getTaskById };
