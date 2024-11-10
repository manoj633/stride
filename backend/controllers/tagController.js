import Tag from "../models/tagModel.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc    Create a new tag
// @route   POST /api/tags
// @access  Public or Protected as needed
export const createTag = asyncHandler(async (req, res) => {
  const { name, color } = req.body;

  const existingTag = await Tag.findOne({ name });
  if (existingTag) {
    res.status(400).json({ message: "Tag with this name already exists" });
    return;
  }

  const tag = new Tag({ name, color });
  const createdTag = await tag.save();
  res.status(201).json(createdTag);
});

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public or Protected as needed
export const getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find();
  res.status(200).json(tags);
});

// @desc    Get a tag by ID
// @route   GET /api/tags/:id
// @access  Public or Protected as needed
export const getTagById = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);

  if (tag) {
    res.status(200).json(tag);
  } else {
    res.status(404).json({ message: "Tag not found" });
  }
});

// @desc    Update a tag by ID
// @route   PUT /api/tags/:id
// @access  Public or Protected as needed
export const updateTag = asyncHandler(async (req, res) => {
  const { name, color } = req.body;
  const tag = await Tag.findById(req.params.id);

  if (tag) {
    tag.name = name || tag.name;
    tag.color = color || tag.color;

    const updatedTag = await tag.save();
    res.status(200).json(updatedTag);
  } else {
    res.status(404).json({ message: "Tag not found" });
  }
});

// @desc    Delete a tag by ID
// @route   DELETE /api/tags/:id
// @access  Public or Protected as needed
export const deleteTag = asyncHandler(async (req, res) => {
  const tag = await Tag.findById(req.params.id);

  if (tag) {
    await tag.remove();
    res.status(200).json({ message: "Tag removed" });
  } else {
    res.status(404).json({ message: "Tag not found" });
  }
});
