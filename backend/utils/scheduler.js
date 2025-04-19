// utils/scheduler.js
import cron from "node-cron";
import { generateAndSendWeeklyReports } from "./weeklyReportGenerator.js";
import logger from "./logger.js";

export const initScheduler = () => {
  // Schedule weekly report generation - runs every Sunday at 6:00 AM
  cron.schedule("0 6 * * 0", async () => {
    logger.info("Running scheduled weekly report generation");
    try {
      await generateAndSendWeeklyReports();
    } catch (error) {
      logger.error("Error in scheduled weekly report generation", {
        error: error.message,
      });
    }
  });

  logger.info("Scheduler initialized with weekly report generation");
};
