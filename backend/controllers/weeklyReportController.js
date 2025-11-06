import asyncHandler from "../middleware/asyncHandler.js";
import { generateAndSendWeeklyReports } from "../utils/weeklyReportGenerator.js";

// Controller to trigger weekly report
export const triggerWeeklyReport = asyncHandler(async (req, res) => {
  console.log("✅ Weekly report trigger hit at", new Date().toISOString());
  try {
    const result = await generateAndSendWeeklyReports();
    console.log("✅ Report generation result:", result);
    res.status(200).json({
      message: "Weekly report triggered and emails sent.",
      result,
    });
  } catch (error) {
    console.error("❌ Report trigger error:", error);
    res.status(500).json({
      message: "Failed to send weekly report.",
      error: error.message,
    });
  }
});
