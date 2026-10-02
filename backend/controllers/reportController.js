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

  // Deduplicate by normalized date range so duplicate records for the same week are never shown
  const seenDateRanges = new Set();
  const uniqueReports = [];

  for (const report of reports) {
    const startStr = new Date(report.startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const endStr = new Date(report.endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const rangeKey = `${startStr}_${endStr}`;

    if (!seenDateRanges.has(rangeKey)) {
      seenDateRanges.add(rangeKey);
      uniqueReports.push(report);
    }
  }

  res.json(uniqueReports);
});

export { getMyReports };
