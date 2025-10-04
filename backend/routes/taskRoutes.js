import express from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskCompletion,
} from "../controllers/taskController.js";
import extractUser from "../utils/extractUser.js";
import { check } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Get all tasks, create a new task
router
  .route("/")
  .get(extractUser, getTasks)
  .post(
    [
      extractUser,
      check("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be 2-100 characters"),
      check("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description max 500 characters"),
      check("priority").optional(),
      check("startDate")
        .isISO8601()
        .withMessage("Start date must be a valid date"),
      check("endDate").isISO8601().withMessage("End date must be a valid date"),
      check("endDate").custom((value, { req }) => {
        if (req.body.startDate && value < req.body.startDate) {
          throw new Error("End date must be after or equal to start date");
        }
        return true;
      }),
      validate,
    ],
    createTask
  );

// Get, update, or delete task by id
router
  .route("/:id")
  .get(extractUser, getTaskById)
  .put(
    [
      extractUser,
      check("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be 2-100 characters"),
      check("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description max 500 characters"),
      check("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid date"),
      check("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid date"),
      check("endDate")
        .optional()
        .custom((value, { req }) => {
          if (req.body.startDate && value < req.body.startDate) {
            throw new Error("End date must be after or equal to start date");
          }
          return true;
        }),
      validate,
    ],
    updateTask
  )
  .delete(extractUser, deleteTask);

// Partially update task completion
router.route("/:id/completion").put(extractUser, updateTaskCompletion);

export default router;
