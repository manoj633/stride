import express from "express";
import {
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
  updateGoalStatus,
  archiveGoal,
} from "../controllers/goalController.js";
import extractUser from "../utils/extractUser.js";
import { check } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Get all goals and create a new goal
router
  .route("/")
  .get(extractUser, getGoals)
  .post(
    [
      extractUser,
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
    createGoal
  );

// Get, update, or delete goal by id
router
  .route("/:id")
  .get(extractUser, getGoalById)
  .put(
    [
      extractUser,
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
      check("priority")
        .optional()
        .isIn(["High", "Medium", "Low"])
        .withMessage("Priority must be High, Medium, or Low"),
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
    updateGoal
  )
  .delete(extractUser, deleteGoal);

// Partially update goal completion
router.route("/:id/completion").put(extractUser, updateGoalCompletion);

// Add or remove collaborator
router
  .route("/:id/collaborators")
  .put(extractUser, addCollaborator) // To add a collaborator
  .delete(extractUser, removeCollaborator); // To remove a collaborator

// Add or remove tag
router
  .route("/:id/tags")
  .put(extractUser, addTag) // To add a tag
  .delete(extractUser, removeTag); // To remove a tag

// Add or remove comment
router
  .route("/:id/comments")
  .put(extractUser, addComment) // To add a comment
  .delete(extractUser, removeComment); // To remove a comment

router.route("/:id/status").patch(extractUser, updateGoalStatus);

router.route("/:id/archive").post(extractUser, archiveGoal);

export default router;
