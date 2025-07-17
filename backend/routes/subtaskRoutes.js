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
      check("priority").optional(),
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
      check("priority").optional(),
      validate,
    ],
    updateSubtask
  )
  .delete(extractUser, deleteSubtask);

router.route("/:id/complete").patch(extractUser, markSubtaskAsCompleted);

export default router;
