// utils/scheduler.js
import cron from "node-cron";
import { generateAndSendWeeklyReports } from "./weeklyReportGenerator.js";
import { sendGoalReminders } from "./goalReminder.js";
import { triggerYearInReviewForActiveUsers } from "./yearInReviewNotification.js";
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

  // Schedule goal reminders - runs every day at 7:00 AM
  cron.schedule("0 7 * * *", async () => {
    logger.info("Running scheduled goal reminders");
    try {
      await sendGoalReminders();
    } catch (error) {
      logger.error("Error in scheduled goal reminders", {
        error: error.message,
      });
    }
  });

  // Schedule annual Year in Review notifications - runs January 1st at midnight (00:00)
  cron.schedule("0 0 1 1 *", async () => {
    logger.info("Running scheduled annual Year in Review notifications");
    try {
      await triggerYearInReviewForActiveUsers();
    } catch (error) {
      logger.error("Error in scheduled Year in Review notifications", {
        error: error.message,
      });
    }
  });

  logger.info(
    "Scheduler initialized with weekly reports, daily reminders, and annual Year in Review"
  );
};
