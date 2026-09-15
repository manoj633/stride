import express from "express";
import {
  getEngagementAnalytics,
  getFeatureUsageAnalytics,
  getSecurityAnalytics,
  getSystemHealthAnalytics,
} from "../controllers/adminAnalyticsController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, admin);

router.get("/engagement", getEngagementAnalytics);
router.get("/feature-usage", getFeatureUsageAnalytics);
router.get("/security", getSecurityAnalytics);
router.get("/system-health", getSystemHealthAnalytics);

export default router;
