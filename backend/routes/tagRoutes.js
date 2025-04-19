import express from "express";
import {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
} from "../controllers/tagController.js";
import extractUser from "../utils/extractUser.js";

const router = express.Router();

router.route("/").post(extractUser, createTag).get(extractUser, getTags); // Create a new tag, Get all tags
router
  .route("/:id")
  .get(extractUser, getTagById)
  .put(extractUser, updateTag)
  .delete(extractUser, deleteTag); // Get, Update, Delete a tag by ID

export default router;
