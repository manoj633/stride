import express from "express";
import {
  createComment,
  getGoalComments,
  updateComment,
  deleteComment,
  adminGetComments,
} from "../controllers/commentController.js";
import extractUser from "../utils/extractUser.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { check } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";
import { commentLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Admin comment moderation (placed before dynamic routes)
router.get("/admin/all", protect, admin, adminGetComments);

router
  .route("/")
  .post(
    [
      commentLimiter,
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
