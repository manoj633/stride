// src/controllers/searchController.js
import asyncHandler from "../middleware/asyncHandler.js";
import Goal from "../models/goalModel.js";
import Task from "../models/taskModel.js";
import Subtask from "../models/subtaskModel.js";
import logger from "../utils/logger.js";

/**
 * @desc    Global unified search across Goals, Tasks, and Subtasks across all years
 * @route   GET /api/search
 * @access  Private
 */
const searchAll = asyncHandler(async (req, res) => {
  const queryStr = req.query.q ? String(req.query.q).trim() : "";
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const typeFilter = req.query.type || "all"; // "all" | "goals" | "tasks" | "subtasks"

  logger.info("Executing global search", {
    userId: req.userId,
    query: queryStr,
    limit,
    typeFilter,
  });

  if (!queryStr) {
    return res.json({
      query: "",
      total: 0,
      goals: [],
      tasks: [],
      subtasks: [],
    });
  }

  const escaped = queryStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const searchGoals = typeFilter === "all" || typeFilter === "goals";
  const searchTasks = typeFilter === "all" || typeFilter === "tasks";
  const searchSubtasks = typeFilter === "all" || typeFilter === "subtasks";

  const [rawGoals, rawTasks, rawSubtasks] = await Promise.all([
    searchGoals
      ? Goal.find({
          createdBy: req.userId,
          $or: [
            { title: regex },
            { description: regex },
            { category: regex },
          ],
        })
          .select("_id title description category priority status duration completionPercentage completed archived createdAt updatedAt")
          .limit(limit)
          .sort({ updatedAt: -1, createdAt: -1 })
          .lean()
      : Promise.resolve([]),

    searchTasks
      ? Task.find({
          createdBy: req.userId,
          $or: [{ name: regex }, { description: regex }],
        })
          .populate("goalId", "title category")
          .select("_id name description priority startDate endDate completed completionPercentage goalId createdAt updatedAt")
          .limit(limit)
          .sort({ updatedAt: -1, createdAt: -1 })
          .lean()
      : Promise.resolve([]),

    searchSubtasks
      ? Subtask.find({
          createdBy: req.userId,
          $or: [{ name: regex }, { description: regex }],
        })
          .populate("taskId", "name")
          .populate("goalId", "title")
          .select("_id name description priority dueDate completed taskId goalId createdAt updatedAt")
          .limit(limit)
          .sort({ updatedAt: -1, createdAt: -1 })
          .lean()
      : Promise.resolve([]),
  ]);

  const goals = rawGoals.map((g) => ({
    id: g._id.toString(),
    type: "goal",
    title: g.title,
    description: g.description || "",
    category: g.category || "General",
    priority: g.priority || "Medium",
    status: g.status || "in-progress",
    year: g.duration?.startDate
      ? new Date(g.duration.startDate).getFullYear()
      : g.createdAt
      ? new Date(g.createdAt).getFullYear()
      : null,
    completionPercentage: g.completionPercentage || 0,
    completed: Boolean(g.completed || g.completionPercentage === 100),
    archived: Boolean(g.archived),
    url: `/goals/${g._id}`,
  }));

  const tasks = rawTasks.map((t) => ({
    id: t._id.toString(),
    type: "task",
    title: t.name,
    description: t.description || "",
    priority: t.priority || "Medium",
    year: t.startDate
      ? new Date(t.startDate).getFullYear()
      : t.createdAt
      ? new Date(t.createdAt).getFullYear()
      : null,
    startDate: t.startDate || null,
    endDate: t.endDate || null,
    completionPercentage: t.completionPercentage || 0,
    completed: Boolean(t.completed || t.completionPercentage === 100),
    goalTitle: t.goalId?.title || null,
    goalId: t.goalId?._id?.toString() || (t.goalId ? t.goalId.toString() : null),
    url: `/tasks/${t._id}`,
  }));

  const subtasks = rawSubtasks.map((s) => ({
    id: s._id.toString(),
    type: "subtask",
    title: s.name,
    description: s.description || "",
    priority: s.priority || "Medium",
    dueDate: s.dueDate || null,
    completed: Boolean(s.completed),
    taskName: s.taskId?.name || null,
    taskId: s.taskId?._id?.toString() || (s.taskId ? s.taskId.toString() : null),
    goalTitle: s.goalId?.title || null,
    goalId: s.goalId?._id?.toString() || (s.goalId ? s.goalId.toString() : null),
    url: `/subtasks/${s._id}`,
  }));

  const total = goals.length + tasks.length + subtasks.length;

  res.json({
    query: queryStr,
    total,
    goals,
    tasks,
    subtasks,
  });
});

export { searchAll };
