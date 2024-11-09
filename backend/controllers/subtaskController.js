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
 * * route: /api/tasks/:id
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

export { getSubtasks, getSubtaskById };
