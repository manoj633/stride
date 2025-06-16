// utils/goalReminder.js
import Goal from "../models/goalModel.js";
import User from "../models/userModel.js";
import sendEmail from "./emailService.js";
import logger from "./logger.js";
import Task from "../models/taskModel.js";
import Subtask from "../models/subtaskModel.js";
import { MOTIVATIONAL_QUOTES } from "./motivationQuotes.js";

// Days before due date to send reminders
const REMINDER_WINDOWS = [7, 3, 1, 0]; // 0 = due today

export const sendGoalReminders = async () => {
  logger.info("Running scheduled goal reminder job");
  const now = new Date();

  for (const daysBefore of REMINDER_WINDOWS) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysBefore);
    targetDate.setHours(0, 0, 0, 0);

    // Find goals ending on this date, not completed
    const goals = await Goal.find({
      "duration.endDate": {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      },
      completed: false,
    }).populate("createdBy");

    for (const goal of goals) {
      const user = goal.createdBy;
      if (!user || !user.email) continue;
      // Fetch tasks and subtasks for checklist
      const tasks = await Task.find({ goalId: goal._id });
      let subtasks = [];
      for (const task of tasks) {
        const taskSubtasks = await Subtask.find({ taskId: task._id });
        subtasks = subtasks.concat(taskSubtasks);
      }
      // Progress bar calculation
      const totalDays = Math.ceil(
        (goal.duration.endDate - goal.duration.startDate) /
          (1000 * 60 * 60 * 24)
      );
      const daysLeft = Math.ceil(
        (goal.duration.endDate - now) / (1000 * 60 * 60 * 24)
      );
      const progressPercent = Math.max(
        0,
        Math.min(100, Math.round(((totalDays - daysLeft) / totalDays) * 100))
      );
      // Random motivational quote
      const quote =
        MOTIVATIONAL_QUOTES[
          Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
        ];
      let subject = "";
      let daysText =
        daysBefore === 0 ? "today" : `in <b>${daysBefore}</b> day(s)`;
      let dueDateStr = goal.duration.endDate.toLocaleDateString();
      if (daysBefore === 0) {
        subject = `Goal Due Today: ${goal.title}`;
      } else {
        subject = `Goal Due Soon: ${goal.title}`;
      }
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎯 Stride Goal Reminder</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f9f9f9;">
        <div style="max-width:600px;margin:0 auto;background:#fff;padding:28px 24px 18px 24px;border-radius:14px;box-shadow:0 0 18px rgba(52,152,219,0.08);">
          <div style="text-align:center;padding-bottom:18px;border-bottom:1px solid #eee;">
            <h1 style="color:#2c3e50;margin-bottom:8px;font-size:2.1em;">🎯 Stride Goal Reminder</h1>
            <p style="color:#7f8c8d;margin:0;font-size:1.1em;">Hey ${user.name || "there"}, your goal journey continues!</p>
          </div>
          <div style="background:#e0e7ff;border-radius:8px;padding:20px 18px;margin:24px 0 18px 0;box-shadow:0 2px 8px rgba(52,152,219,0.04);">
            <div style="font-size:1.4em;font-weight:bold;color:#5b21b6;margin-bottom:8px;">${goal.title}</div>
            <div style="color:#e67e22;font-size:1.1em;margin-bottom:8px;">Due: <b>${dueDateStr}</b> (${daysText})</div>
            <div style="color:#555;margin-bottom:8px;">${goal.description || "No description provided."}</div>
            <div style="text-align:right;font-size:0.95em;color:#2563eb;margin-bottom:2px;">Progress: ${progressPercent}%</div>
            <div style="width:100%;background:#e5e7eb;border-radius:8px;height:18px;margin:12px 0 8px 0;overflow:hidden;">
              <div style="height:100%;background:#60a5fa;width:${progressPercent}%;border-radius:8px;"></div>
            </div>
            ${subtasks.length > 0 ? `<ul style="margin:18px 0 0 0;padding:0;list-style:none;">
              ${subtasks.map(st => `<li style="margin-bottom:6px;font-size:1em;${st.completed ? 'text-decoration:line-through;color:#10b981;' : 'color:#374151;'}">${st.name}</li>`).join('')}
            </ul>` : ''}
          </div>
          <div style="text-align:center;margin:18px 0;">
            <a style="display:inline-block;padding:10px 28px;background:#6366f1;color:#fff;border-radius:6px;font-size:1.1em;text-decoration:none;font-weight:bold;box-shadow:0 2px 8px rgba(52,152,219,0.08);" href="https://stride-qd71.onrender.com/goals/${goal._id}" target="_blank">View Goal</a>
          </div>
          <div style="margin:24px 0 0 0;font-style:italic;color:#6366f1;text-align:center;font-size:1.1em;">“${quote}”</div>
          <div style="text-align:center;padding-top:18px;border-top:1px solid #eee;color:#7f8c8d;font-size:14px;">
            <p>This is an automated reminder from Stride. Keep striving and have fun! 🎉</p>
          </div>
        </div>
      </body>
      </html>
      `;
      await sendEmail({
        email: user.email,
        subject,
        html,
      });
      logger.info(`Reminder sent to ${user.email} for goal ${goal._id}`);
    }
  }
  logger.info("Goal reminder job completed");
};
