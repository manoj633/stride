import asyncHandler from "../middleware/asyncHandler.js";
import WeeklyReport from "../models/weeklyReportModel.js";

// @desc    Get all weekly reports for logged-in user
// @route   GET /api/reports/my-reports
// @access  Private (works with both protect and extractUser middleware)
const getMyReports = asyncHandler(async (req, res) => {
  // Support both protect middleware (req.user._id) and extractUser (req.userId)
  const userId = req.user?._id || req.userId;
  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }
  const reports = await WeeklyReport.find({ user: userId }).sort({ createdAt: -1 });
  res.json(reports);
});

export { getMyReports };
