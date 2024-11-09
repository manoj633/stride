import express from "express";
import { getGoalById, getGoals } from "../controllers/goalController.js";

const router = express.Router();

router.route("/").get(getGoals);

router.route("/:id").get(getGoalById);

export default router;
