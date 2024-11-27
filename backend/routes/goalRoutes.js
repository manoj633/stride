import express from "express";
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalCompletion,
  addCollaborator,
  removeCollaborator,
  addTag,
  removeTag,
  addComment,
  removeComment,
  updateGoalStatus,
  archiveGoal,
} from "../controllers/goalController.js";
import extractUser from "../utils/extractUser.js";

const router = express.Router();

// Get all goals and create a new goal
router.route("/").get(extractUser, getGoals).post(extractUser, createGoal);

// Get, update, or delete goal by id
router.route("/:id").get(getGoalById).put(updateGoal).delete(deleteGoal);

// Partially update goal completion
router.route("/:id/completion").put(updateGoalCompletion);

// Add or remove collaborator
router
  .route("/:id/collaborators")
  .put(addCollaborator) // To add a collaborator
  .delete(removeCollaborator); // To remove a collaborator

// Add or remove tag
router
  .route("/:id/tags")
  .put(addTag) // To add a tag
  .delete(removeTag); // To remove a tag

// Add or remove comment
router
  .route("/:id/comments")
  .put(addComment) // To add a comment
  .delete(removeComment); // To remove a comment

router.route("/:id/status").patch(updateGoalStatus);

router.route("/:id/archive").post(archiveGoal);

export default router;
