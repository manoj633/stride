import express from "express";
import {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
} from "../controllers/tagController.js";

const router = express.Router();

router.route("/").post(createTag).get(getTags); // Create a new tag, Get all tags
router.route("/:id").get(getTagById).put(updateTag).delete(deleteTag); // Get, Update, Delete a tag by ID

export default router;
