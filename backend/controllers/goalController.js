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

/**
 * * Description: Create a new goal
 * * route: /api/goals
 * * access: Public
 */
const createGoal = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    priority,
    duration,
    collaborators,
    tags,
  } = req.body;

  const goal = new Goal({
    title,
    description,
    category,
    priority,
    duration,
    collaborators,
    tags,
  });

  const createdGoal = await goal.save();
  res.status(201).json(createdGoal);
});

/**
 * * Description: Update a goal by id
 * * route: /api/goals/:id
 * * access: Public
 */
const updateGoal = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    priority,
    duration,
    collaborators,
    tags,
    completionPercentage,
    completed,
  } = req.body;

  const goal = await Goal.findById(req.params.id);

  if (goal) {
    goal.title = title || goal.title;
    goal.description = description || goal.description;
    goal.category = category || goal.category;
    goal.priority = priority || goal.priority;
    goal.duration = duration || goal.duration;
    goal.collaborators = collaborators || goal.collaborators;
    goal.tags = tags || goal.tags;
    goal.completionPercentage =
      completionPercentage || goal.completionPercentage;
    goal.completed = completed !== undefined ? completed : goal.completed;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

/**
 * * Description: Delete a goal by id
 * * route: /api/goals/:id
 * * access: Public
 */
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (goal) {
    await Goal.deleteOne({ _id: req.params.id });
    res.json({ message: "Goal removed" });
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

/**
 * * Description: Partially update a goal's completion status or percentage
 * * route: /api/goals/:id/completion
 * * access: Public
 */
const updateGoalCompletion = asyncHandler(async (req, res) => {
  const { completed, completionPercentage } = req.body;

  const goal = await Goal.findById(req.params.id);

  if (goal) {
    if (completed !== undefined) goal.completed = completed;
    if (completionPercentage !== undefined)
      goal.completionPercentage = completionPercentage;

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

/**
 * * Description: Add collaborator to a goal
 * * route: /api/goals/:id/collaborators
 * * access: Public
 */
const addCollaborator = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  const { collaboratorId } = req.body;

  if (goal) {
    if (!goal.collaborators.includes(collaboratorId)) {
      goal.collaborators.push(collaboratorId);
      const updatedGoal = await goal.save();
      return res.json(updatedGoal);
    } else {
      res.status(400);
      throw new Error("Collaborator already added");
    }
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

/**
 * * Description: Remove collaborator from a goal
 * * route: /api/goals/:id/collaborators
 * * access: Public
 */
const removeCollaborator = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  const { collaboratorId } = req.body;

  if (goal) {
    goal.collaborators = goal.collaborators.filter(
      (collaborator) => collaborator.toString() !== collaboratorId
    );
    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

/**
 * * Description: Add a tag to a goal
 * * route: /api/goals/:id/tags
 * * access: Public
 */
const addTag = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  const { tagId } = req.body;

  if (goal) {
    if (!goal.tags.includes(tagId)) {
      goal.tags.push(tagId);
      const updatedGoal = await goal.save();
      return res.json(updatedGoal);
    } else {
      res.status(400);
      throw new Error("Tag already added");
    }
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

/**
 * * Description: Remove a tag from a goal
 * * route: /api/goals/:id/tags
 * * access: Public
 */
const removeTag = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  const { tagId } = req.body;

  if (goal) {
    goal.tags = goal.tags.filter((tag) => tag.toString() !== tagId);
    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

/**
 * * Description: Add a comment to a goal
 * * route: /api/goals/:id/comments
 * * access: Public
 */
const addComment = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  const { commentId } = req.body;

  if (goal) {
    goal.comments.push(commentId);
    const updatedGoal = await goal.save();
    return res.json(updatedGoal);
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

/**
 * * Description: Remove a comment from a goal
 * * route: /api/goals/:id/comments
 * * access: Public
 */
const removeComment = asyncHandler(async (req, res) => {
  const goal = await Goal.findById(req.params.id);
  const { commentId } = req.body;

  if (goal) {
    goal.comments = goal.comments.filter(
      (comment) => comment.toString() !== commentId
    );
    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } else {
    res.status(404);
    throw new Error("Goal not found");
  }
});

export {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalCompletion,
  addCollaborator,
  removeCollaborator,
  addTag,
  removeTag,
  addComment,
  removeComment,
};
