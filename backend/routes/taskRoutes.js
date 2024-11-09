import express from "express";

import { getTaskById, getTasks } from "../controllers/taskController.js";

const router = express.Router();

router.route("/").get(getTasks);

router.route("/:id").get(getTaskById);

export default router;
