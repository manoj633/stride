import Notification from "../models/notificationModel.js";

export const createGoalReminderNotification = async ({
  userId,
  goal,
  daysBefore,
}) => {
  let daysText = daysBefore === 0 ? "today" : `in ${daysBefore} day(s)`;
  let dueDateStr = goal.duration.endDate.toLocaleDateString();
  let title =
    daysBefore === 0
      ? `Goal Due Today: ${goal.title}`
      : `Goal Due Soon: ${goal.title}`;
  let message = `Your goal <b>${goal.title}</b> is due ${daysText} (on ${dueDateStr}). Keep up the good work!`;
  await Notification.create({
    user: userId,
    type: "goal-reminder",
    title,
    message,
    goal: goal._id,
  });
};
