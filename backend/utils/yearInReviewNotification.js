import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import logger from "./logger.js";

/**
 * Checks if a user has crossed into a new year or hasn't received the Year in Review notification yet.
 * Ensures strictly one notification per year per user.
 */
export const checkAndTriggerYearInReviewNotification = async (userId) => {
  try {
    const user = await User.findById(userId).select("createdAt lastActive");
    if (!user) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const isJanuary = now.getMonth() === 0;

    // If January, surface the year that just concluded (currentYear - 1)
    // Otherwise, surface the current year's review
    const targetYear = isJanuary ? currentYear - 1 : currentYear;

    // Idempotence check: Has this user already received a Year in Review notification for targetYear?
    const existing = await Notification.findOne({
      user: userId,
      type: "year-in-review",
      title: { $regex: `${targetYear}` },
    });

    if (existing) {
      return;
    }

    // Create the one-time notification
    await Notification.create({
      user: userId,
      type: "year-in-review",
      title: `Your ${targetYear} Year in Review is ready! 🏆`,
      message: `Explore your annual accomplishments, focus hours, task velocity, and productivity archetype for ${targetYear}. <a href="/year-in-review" style="color:#4f46e5;font-weight:600;text-decoration:underline;">View Retrospective →</a>`,
      isRead: false,
    });

    logger.info(`Year in Review notification created for user ${userId} for year ${targetYear}`);
  } catch (error) {
    logger.error(`Error in checkAndTriggerYearInReviewNotification: ${error.message}`);
  }
};

/**
 * Batch trigger for all active users (e.g. executed via scheduler on Jan 1)
 */
export const triggerYearInReviewForActiveUsers = async () => {
  try {
    const now = new Date();
    const targetYear = now.getFullYear() - 1;
    const users = await User.find({ isSuspended: { $ne: true } }).select("_id");
    for (const u of users) {
      await checkAndTriggerYearInReviewNotification(u._id);
    }
    logger.info(`Annual Year in Review notifications processed for ${users.length} users for year ${targetYear}`);
  } catch (error) {
    logger.error(`Error in triggerYearInReviewForActiveUsers: ${error.message}`);
  }
};
