import express from "express";
import {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
} from "../controllers/tagController.js";
import extractUser from "../utils/extractUser.js";
import { check } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    [
      extractUser,
      check("name")
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage("Tag name must be 2-30 characters"),
      check("color")
        .matches(/^#([0-9A-F]{3}){1,2}$/i)
        .withMessage("Color must be a valid hex code"),
      validate,
    ],
    createTag
  )
  .get(extractUser, getTags); // Create a new tag, Get all tags
router
  .route("/:id")
  .get(extractUser, getTagById)
  .put(
    [
      extractUser,
      check("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage("Tag name must be 2-30 characters"),
      check("color")
        .optional()
        .matches(/^#([0-9A-F]{3}){1,2}$/i)
        .withMessage("Color must be a valid hex code"),
      validate,
    ],
    updateTag
  )
  .delete(extractUser, deleteTag); // Get, Update, Delete a tag by ID

export default router;
