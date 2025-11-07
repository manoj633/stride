import asyncHandler from "../middleware/asyncHandler.js";
import { generateAndSendWeeklyReports } from "../utils/weeklyReportGenerator.js";

// Controller to trigger weekly report
// Controller to trigger weekly report
export const triggerWeeklyReport = asyncHandler(async (req, res) => {
  console.log("✅ Weekly report trigger hit at", new Date().toISOString());

  // Respond immediately to cron
  res.status(200).json({
    message: "Weekly report generation started.",
    timestamp: new Date().toISOString(),
  });

  // Process asynchronously (no await)
  generateAndSendWeeklyReports()
    .then((result) => {
      console.log("✅ Report generation result:", result);
    })
    .catch((error) => {
      console.error("❌ Report trigger error:", error);
    });
});
