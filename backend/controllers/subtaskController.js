import asyncHandler from "../middleware/asyncHandler.js";
import Subtask from "../models/subtaskModel.js";

/**
 * * Description: Fetch all subtasks
 * * route: /api/subtasks
 * * access: Public
 */
const getSubtasks = asyncHandler(async (req, res) => {
  const subtasks = await Subtask.find({});
  res.json(subtasks);
});

/**
 * * Description: Fetch subtask by id
 * * route: /api/subtasks/:id
 * * access: Public
 */
const getSubtaskById = asyncHandler(async (req, res) => {
  const subtask = await Subtask.findById(req.params.id);
  if (subtask) {
    return res.json(subtask);
  }
  res.status(404);
  throw new Error("Resource not found");
});

/**
 * * Description: Create a new subtask
 * * route: /api/subtasks
 * * access: Public
 */
const createSubtask = asyncHandler(async (req, res) => {
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
  res.status(201).json(createdSubtask);
});

/**
 * * Description: Update a subtask
 * * route: /api/subtasks/:id
 * * access: Public
 */
const updateSubtask = asyncHandler(async (req, res) => {
  const { name, description, priority, dueDate, completed } = req.body;
  const subtask = await Subtask.findById(req.params.id);

  if (subtask) {
    subtask.name = name || subtask.name;
    subtask.description = description || subtask.description;
    subtask.priority = priority || subtask.priority;
    subtask.dueDate = dueDate || subtask.dueDate;
    subtask.completed = completed !== undefined ? completed : subtask.completed;

    const updatedSubtask = await subtask.save();
    res.json(updatedSubtask);
  } else {
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
  const subtask = await Subtask.findById(req.params.id);

  if (subtask) {
    await subtask.remove();
    res.json({ message: "Subtask removed" });
  } else {
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
  const subtask = await Subtask.findById(req.params.id);

  if (subtask) {
    subtask.completed = true;
    const updatedSubtask = await subtask.save();
    res.json(updatedSubtask);
  } else {
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
