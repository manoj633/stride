import express from "express";
import { triggerWeeklyReport } from "../controllers/weeklyReportController.js";

const router = express.Router();

// Security: require a secret token in the header
router.post(
  "/trigger",
  (req, res, next) => {
    const expectedToken = process.env.REPORT_TRIGGER_SECRET;
    const providedToken = req.headers["x-report-trigger-token"];
    if (!expectedToken || providedToken !== expectedToken) {
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid or missing token" });
    }
    next();
  },
  triggerWeeklyReport
);

export default router;
