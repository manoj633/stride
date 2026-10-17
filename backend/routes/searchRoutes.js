import express from "express";
import { searchAll } from "../controllers/searchController.js";
import extractUser from "../utils/extractUser.js";

const router = express.Router();

router.get("/", extractUser, searchAll);

export default router;
