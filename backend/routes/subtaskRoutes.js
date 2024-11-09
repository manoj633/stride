import express from "express";
import {
  getSubtasks,
  getSubtaskById,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  markSubtaskAsCompleted,
} from "../controllers/subtaskController.js";

const router = express.Router();

router.route("/").get(getSubtasks).post(createSubtask);

router
  .route("/:id")
  .get(getSubtaskById)
  .put(updateSubtask)
  .delete(deleteSubtask);

router.route("/:id/complete").patch(markSubtaskAsCompleted);

export default router;
