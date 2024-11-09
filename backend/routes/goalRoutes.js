import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import Goal from "../models/goalModel.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const goals = await Goal.find({});
    res.json(goals);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const goal = await Goal.findById(req.params.id);
    if (goal) {
      return res.json(goal);
    }

    res.status(400).json({ message: "Goal not found" });
  })
);

export default router;
