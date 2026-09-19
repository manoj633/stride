import asyncHandler from "../middleware/asyncHandler.js";
import Notification from "../models/notificationModel.js";
import { checkAndTriggerYearInReviewNotification } from "../utils/yearInReviewNotification.js";

// GET /api/notifications - get all notifications for the logged-in user
export const getNotifications = asyncHandler(async (req, res) => {
  // Surface one-time annual Year in Review notification if due
  await checkAndTriggerYearInReviewNotification(req.user._id);

  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(notifications);
});

// PATCH /api/notifications/:id/read - mark a notification as read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  notification.isRead = true;
  await notification.save();
  res.json({ success: true });
});
