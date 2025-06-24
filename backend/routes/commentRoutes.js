import express from "express";
import {
  createComment,
  getGoalComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import extractUser from "../utils/extractUser.js";
import { check } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    [
      extractUser,
      check("content")
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage("Comment content must be 1-500 characters"),
      validate,
    ],
    createComment
  );
router.route("/goal/:goalId").get(extractUser, getGoalComments);
router
  .route("/:commentId")
  .put(
    [
      extractUser,
      check("content")
        .optional()
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage("Comment content must be 1-500 characters"),
      validate,
    ],
    updateComment
  )
  .delete(extractUser, deleteComment);

export default router;
