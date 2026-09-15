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
      check("text")
        .custom((value, { req }) => {
          const textValue = (req.body.text !== undefined ? req.body.text : req.body.content);
          if (!textValue || typeof textValue !== "string" || textValue.trim().length === 0) {
            throw new Error("Comment text is required");
          }
          if (textValue.trim().length > 500) {
            throw new Error("Comment text must be between 1 and 500 characters");
          }
          // Normalize text onto req.body.text so controller reliably reads it
          req.body.text = textValue.trim();
          return true;
        }),
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
      check("text")
        .optional()
        .custom((value, { req }) => {
          const textValue = (req.body.text !== undefined ? req.body.text : req.body.content);
          if (textValue !== undefined) {
            if (typeof textValue !== "string" || textValue.trim().length === 0) {
              throw new Error("Comment text cannot be empty");
            }
            if (textValue.trim().length > 500) {
              throw new Error("Comment text must be between 1 and 500 characters");
            }
            req.body.text = textValue.trim();
          }
          return true;
        }),
      validate,
    ],
    updateComment
  )
  .delete(extractUser, deleteComment);

export default router;
