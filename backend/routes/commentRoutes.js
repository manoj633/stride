import express from "express";
import {
  createComment,
  getGoalComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import extractUser from "../utils/extractUser.js";

const router = express.Router();

router.route("/").post(extractUser, createComment);
router.route("/goal/:goalId").get(extractUser, getGoalComments);
router
  .route("/:commentId")
  .put(extractUser, updateComment)
  .delete(extractUser, deleteComment);

export default router;
