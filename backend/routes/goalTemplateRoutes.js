import express from "express";
import {
  getGoalTemplates,
  getGoalTemplateById,
  createGoalTemplate,
  updateGoalTemplate,
  deleteGoalTemplate,
} from "../controllers/goalTemplateController.js";
import { protect } from "../middleware/authMiddleware.js";
import { check } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Get all templates (public + user-specific)
router.route("/").get(protect, getGoalTemplates);

// Create a new user-specific template
router.route("/").post(
  [
    protect,
    check("title")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Title must be 2-100 characters"),
    check("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description max 500 characters"),
    check("category")
      .optional()
      .isIn([
        "Education",
        "Health",
        "Leisure",
        "Fitness",
        "Career",
        "Work",
        "Personal",
        "Other",
      ])
      .withMessage("Invalid category"),
    check("duration.startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    check("duration.endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
    check("duration.endDate")
      .optional()
      .custom((value, { req }) => {
        if (
          req.body.duration &&
          req.body.duration.startDate &&
          value <= req.body.duration.startDate
        ) {
          throw new Error("End date must be after start date");
        }
        return true;
      }),
    validate,
  ],
  createGoalTemplate
);

// Get, update, delete a template by ID
router
  .route("/:id")
  .get(protect, getGoalTemplateById)
  .put(
    [
      protect,
      check("title")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Title must be 2-100 characters"),
      check("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description max 500 characters"),
      check("category")
        .optional()
        .isIn([
          "Education",
          "Health",
          "Leisure",
          "Fitness",
          "Career",
          "Work",
          "Personal",
          "Other",
        ])
        .withMessage("Invalid category"),
      check("duration.startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid date"),
      check("duration.endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid date"),
      check("duration.endDate")
        .optional()
        .custom((value, { req }) => {
          if (
            req.body.duration &&
            req.body.duration.startDate &&
            value <= req.body.duration.startDate
          ) {
            throw new Error("End date must be after start date");
          }
          return true;
        }),
      validate,
    ],
    updateGoalTemplate
  )
  .delete(protect, deleteGoalTemplate);

export default router;
