import Tag from "../models/tagModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import logger from "../utils/logger.js";

// @desc    Create a new tag
// @route   POST /api/tags
// @access  Public or Protected as needed
export const createTag = asyncHandler(async (req, res) => {
  const { name, color } = req.body;

  try {
    const existingTag = await Tag.findOne({ name });
    if (existingTag) {
      logger.warn(
        `Tag creation failed: Tag with name "${name}" already exists`
      );
      return res
        .status(400)
        .json({ message: "Tag with this name already exists" });
    }

    const tag = new Tag({ name, color });
    const createdTag = await tag.save();
    logger.info(`Created new tag with ID: ${createdTag._id}`);
    res.status(201).json(createdTag);
  } catch (error) {
    logger.error("Error creating tag:", error);
    res.status(500).json({ message: "Error creating tag" });
  }
});

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public or Protected as needed
export const getTags = asyncHandler(async (req, res) => {
  try {
    const tags = await Tag.find();
    logger.info("Fetched all tags");
    res.status(200).json(tags);
  } catch (error) {
    logger.error("Error fetching tags:", error);
    res.status(500).json({ message: "Error fetching tags" });
  }
});

// @desc    Get a tag by ID
// @route   GET /api/tags/:id
// @access  Public or Protected as needed
export const getTagById = asyncHandler(async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (tag) {
      logger.info(`Fetched tag with ID: ${req.params.id}`);
      res.status(200).json(tag);
    } else {
      logger.warn(`Tag not found with ID: ${req.params.id}`);
      res.status(404).json({ message: "Tag not found" });
    }
  } catch (error) {
    logger.error("Error fetching tag by ID:", error);
    res.status(500).json({ message: "Error fetching tag" });
  }
});

// @desc    Update a tag by ID
// @route   PUT /api/tags/:id
// @access  Public or Protected as needed
export const updateTag = asyncHandler(async (req, res) => {
  const { name, color } = req.body;
  try {
    const tag = await Tag.findById(req.params.id);

    if (tag) {
      tag.name = name || tag.name;
      tag.color = color || tag.color;

      const updatedTag = await tag.save();
      logger.info(`Updated tag with ID: ${req.params.id}`);
      res.status(200).json(updatedTag);
    } else {
      logger.warn(`Tag not found with ID: ${req.params.id}`);
      res.status(404).json({ message: "Tag not found" });
    }
  } catch (error) {
    logger.error("Error updating tag:", error);
    res.status(500).json({ message: "Error updating tag" });
  }
});

// @desc    Delete a tag by ID
// @route   DELETE /api/tags/:id
// @access  Public or Protected as needed
export const deleteTag = asyncHandler(async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (tag) {
      await tag.deleteOne();
      logger.info(`Deleted tag with ID: ${req.params.id}`);
      res.status(200).json({ message: "Tag removed" });
    } else {
      logger.warn(`Tag not found with ID: ${req.params.id}`);
      res.status(404).json({ message: "Tag not found" });
    }
  } catch (error) {
    logger.error("Error deleting tag:", error);
    res.status(500).json({ message: "Error deleting tag" });
  }
});
