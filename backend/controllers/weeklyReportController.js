import asyncHandler from "../middleware/asyncHandler.js";
// Import your weekly report generator logic
import weeklyReportGenerator from "../utils/weeklyReportGenerator.js";

// Controller to trigger weekly report
export const triggerWeeklyReport = asyncHandler(async (req, res) => {
  try {
    await weeklyReportGenerator();
    res.status(200).json({ message: "Weekly report triggered and emails sent." });
  } catch (error) {
    res.status(500).json({ message: "Failed to send weekly report.", error: error.message });
  }
});
