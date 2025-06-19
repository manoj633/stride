import asyncHandler from "../middleware/asyncHandler.js";
import GoalTemplate from "../models/goalTemplateModel.js";
import logger from "../utils/logger.js";

// Get all templates (public + user-specific)
const getGoalTemplates = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const templates = await GoalTemplate.find({
    $or: [{ isPublic: true }, { createdBy: userId }],
  });
  logger.info("Fetched goal templates", { count: templates.length, userId });
  res.json(templates);
});

// Get a template by ID (if public or owned by user)
const getGoalTemplateById = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const template = await GoalTemplate.findById(req.params.id);
  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }
  if (
    template.isPublic ||
    (template.createdBy && template.createdBy.equals(userId))
  ) {
    res.json(template);
  } else {
    res.status(403);
    throw new Error("Not authorized to access this template");
  }
});

// Create a new user-specific template
const createGoalTemplate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const template = new GoalTemplate({
    ...req.body,
    isPublic: false,
    createdBy: userId,
  });
  const created = await template.save();
  logger.info("Created user goal template", {
    templateId: created._id,
    userId,
  });
  res.status(201).json(created);
});

// Update a user-specific template
const updateGoalTemplate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const template = await GoalTemplate.findById(req.params.id);
  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }
  if (!template.createdBy || !template.createdBy.equals(userId)) {
    res.status(403);
    throw new Error("Not authorized to update this template");
  }
  Object.assign(template, req.body);
  const updated = await template.save();
  logger.info("Updated user goal template", {
    templateId: updated._id,
    userId,
  });
  res.json(updated);
});

// Delete a user-specific template
const deleteGoalTemplate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const template = await GoalTemplate.findById(req.params.id);
  if (!template) {
    res.status(404);
    throw new Error("Template not found");
  }
  if (!template.createdBy || !template.createdBy.equals(userId)) {
    res.status(403);
    throw new Error("Not authorized to delete this template");
  }
  await template.deleteOne();
  logger.info("Deleted user goal template", {
    templateId: req.params.id,
    userId,
  });
  res.json({ message: "Template deleted" });
});

export {
  getGoalTemplates,
  getGoalTemplateById,
  createGoalTemplate,
  updateGoalTemplate,
  deleteGoalTemplate,
};
