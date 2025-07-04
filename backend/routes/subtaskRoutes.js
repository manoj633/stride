import express from "express";
import {
  getSubtasks,
  getSubtaskById,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  markSubtaskAsCompleted,
} from "../controllers/subtaskController.js";
import extractUser from "../utils/extractUser.js";
import { check } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(extractUser, getSubtasks)
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
      check("priority")
        .optional()
        .isIn(["High", "Medium", "Low"])
        .withMessage("Priority must be High, Medium, or Low"),
      check("dueDate")
        .isISO8601()
        .withMessage("Due date must be a valid date")
        .custom((value) => {
          if (new Date(value) < new Date()) {
            throw new Error("Due date cannot be in the past");
          }
          return true;
        }),
      validate,
    ],
    createSubtask
  );

router
  .route("/:id")
  .get(extractUser, getSubtaskById)
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
      check("priority")
        .optional()
        .isIn(["High", "Medium", "Low"])
        .withMessage("Priority must be High, Medium, or Low"),
      check("dueDate")
        .optional()
        .isISO8601()
        .withMessage("Due date must be a valid date")
        .custom((value) => {
          if (new Date(value) < new Date()) {
            throw new Error("Due date cannot be in the past");
          }
          return true;
        }),
      validate,
    ],
    updateSubtask
  )
  .delete(extractUser, deleteSubtask);

router.route("/:id/complete").patch(extractUser, markSubtaskAsCompleted);

export default router;
