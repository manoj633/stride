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

/**
 * * Description: Create a new task
 * * route: /api/tasks
 * * access: Public
 */
const createTask = asyncHandler(async (req, res) => {
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
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask);
});

/**
 * * Description: Update an existing task
 * * route: /api/tasks/:id
 * * access: Public
 */
const updateTask = asyncHandler(async (req, res) => {
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

  if (task) {
    task.name = name || task.name;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.startDate = startDate || task.startDate;
    task.endDate = endDate || task.endDate;
    task.goalId = goalId || task.goalId;
    task.completionPercentage =
      completionPercentage || task.completionPercentage;
    task.completed = completed !== undefined ? completed : task.completed;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } else {
    res.status(404);
    throw new Error("Task not found");
  }
});

/**
 * * Description: Delete a task by id
 * * route: /api/tasks/:id
 * * access: Public
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    await task.remove();
    res.json({ message: "Task removed" });
  } else {
    res.status(404);
    throw new Error("Task not found");
  }
});

/**
 * * Description: Partially update a task's completion status or completion percentage
 * * route: /api/tasks/:id/completion
 * * access: Public
 */
const updateTaskCompletion = asyncHandler(async (req, res) => {
  const { completed, completionPercentage } = req.body;

  const task = await Task.findById(req.params.id);

  if (task) {
    if (completed !== undefined) task.completed = completed;
    if (completionPercentage !== undefined)
      task.completionPercentage = completionPercentage;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } else {
    res.status(404);
    throw new Error("Task not found");
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
