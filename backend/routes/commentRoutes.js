import express from "express";
import {
  createComment,
  getGoalComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.route("/").post(createComment);
router.route("/goal/:goalId").get(getGoalComments);
router.route("/:commentId").put(updateComment).delete(deleteComment);

export default router;
