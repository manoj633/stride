import express from "express";
import {
  getGoalTemplates,
  getGoalTemplateById,
  createGoalTemplate,
  updateGoalTemplate,
  deleteGoalTemplate,
} from "../controllers/goalTemplateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all templates (public + user-specific)
router.route("/").get(protect, getGoalTemplates);

// Create a new user-specific template
router.route("/").post(protect, createGoalTemplate);

// Get, update, delete a template by ID
router
  .route("/:id")
  .get(protect, getGoalTemplateById)
  .put(protect, updateGoalTemplate)
  .delete(protect, deleteGoalTemplate);

export default router;
