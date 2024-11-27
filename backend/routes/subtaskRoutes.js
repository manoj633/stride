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

const router = express.Router();

router
  .route("/")
  .get(extractUser, getSubtasks)
  .post(extractUser, createSubtask);

router
  .route("/:id")
  .get(extractUser, getSubtaskById)
  .put(updateSubtask)
  .delete(deleteSubtask);

router.route("/:id/complete").patch(markSubtaskAsCompleted);

export default router;
