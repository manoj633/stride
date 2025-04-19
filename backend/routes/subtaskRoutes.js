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
  .put(extractUser, updateSubtask)
  .delete(extractUser, deleteSubtask);

router.route("/:id/complete").patch(extractUser, markSubtaskAsCompleted);

export default router;
