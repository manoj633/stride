import asyncHandler from "../middleware/asyncHandler.js";
import Goal from "../models/goalModel.js";

/**
 * * Description: Fetch all goals
 * * route: /api/goals
 * * access: Public
 */
const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({});
  res.json(goals);
});

/**
 * * Description: Fetch goal by id
 * * route: /api/goals/:id
 * * access: Public
 */
const getGoalById = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  if (goal) {
    return res.json(goal);
  }

  res.status(404);
  throw new Error("Resource not found");
});

export { getGoals, getGoalById };
