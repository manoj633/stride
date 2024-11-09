import express from "express";

import {
  getSubtasks,
  getSubtaskById,
} from "../controllers/subtaskController.js";

const router = express.Router();

router.route("/").get(getSubtasks);

router.route("/:id").get(getSubtaskById);

export default router;
