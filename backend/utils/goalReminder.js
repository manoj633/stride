// utils/goalReminder.js
import Goal from "../models/goalModel.js";
import User from "../models/userModel.js";
import sendEmail from "./emailService.js";
import logger from "./logger.js";
import Task from "../models/taskModel.js";
import Subtask from "../models/subtaskModel.js";
import { MOTIVATIONAL_QUOTES } from "./motivationQuotes.js";
import { createGoalReminderNotification } from "./notificationService.js";

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

      // Get progress emoji
      const getProgressEmoji = (percent) => {
        if (percent < 25) return "🌱";
        if (percent < 50) return "🌿";
        if (percent < 75) return "🌲";
        if (percent < 100) return "🚀";
        return "🎯";
      };

      // Get urgency color
      const getUrgencyColor = (days) => {
        if (days === 0) return "#ef4444"; // Red for due today
        if (days === 1) return "#f97316"; // Orange for 1 day left
        if (days === 3) return "#eab308"; // Yellow for 3 days left
        return "#0ea5e9"; // Blue for 7 days left
      };

      // Random motivational quote
      const quote =
        MOTIVATIONAL_QUOTES[
          Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
        ];

      // Random decorative emoji for subtasks
      const taskEmojis = [
        "✨",
        "🔍",
        "📌",
        "🔖",
        "📝",
        "✅",
        "📎",
        "🎯",
        "🧩",
        "⭐",
      ];

      let subject = "";
      let daysText =
        daysBefore === 0 ? "today" : `in <b>${daysBefore}</b> day(s)`;
      let dueDateStr = goal.duration.endDate.toLocaleDateString();
      if (daysBefore === 0) {
        subject = `⚡ Goal Due TODAY: ${goal.title}`;
      } else {
        subject = `🎯 Goal Reminder: ${goal.title}`;
      }

      const urgencyColor = getUrgencyColor(daysBefore);
      const progressEmoji = getProgressEmoji(progressPercent);

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎯 Stride Goal Reminder</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #4b5563; margin: 0; padding: 0; background-color: #f3f4f6;">
        <!-- Main Container -->
        <div style="max-width:650px; margin:40px auto; background:linear-gradient(to bottom, #ffffff, #f9fafb); padding:0; border-radius:20px; box-shadow:0 12px 24px rgba(0,0,0,0.06); overflow:hidden;">
          
          <!-- Header Banner -->
          <div style="background:linear-gradient(135deg, #6366f1, #8b5cf6); text-align:center; padding:32px 30px 40px; position:relative; overflow:hidden;">
            <div style="position:absolute; top:-50px; right:-50px; width:120px; height:120px; border-radius:60px; background:rgba(255,255,255,0.1);"></div>
            <div style="position:absolute; bottom:-65px; left:-30px; width:120px; height:120px; border-radius:60px; background:rgba(255,255,255,0.08);"></div>
            
            <h1 style="color:#ffffff; margin:0 0 8px; font-size:2.2em; font-weight:700; letter-spacing:-0.5px;">Goal Journey Update</h1>
            <p style="color:rgba(255,255,255,0.9); margin:0; font-size:1.1em; font-weight:300;">Hey ${
              user.name ? user.name.split(" ")[0] : "there"
            }, your adventure continues! ✨</p>
          </div>
          
          <!-- Content Area -->
          <div style="padding:0 30px;">
            
            <!-- Goal Card -->
            <div style="margin:-30px 0 30px; background:white; border-radius:16px; padding:28px; box-shadow:0 8px 16px rgba(0,0,0,0.05); position:relative; border:1px solid #f1f5f9;">
              <div style="position:absolute; top:-12px; right:20px; background:${urgencyColor}; color:white; font-size:0.8em; font-weight:600; padding:5px 12px; border-radius:20px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                ${daysBefore === 0 ? "DUE TODAY!" : `${daysBefore} days left`}
              </div>
              
              <!-- Goal Title -->
              <div style="display:flex; align-items:center; margin-bottom:16px;">
                <span style="font-size:1.6em; margin-right:10px; display:inline-block; animation:pulse 2s infinite;">🎯</span>
                <h2 style="color:#1e293b; margin:0; font-size:1.5em; font-weight:600;">${
                  goal.title
                }</h2>
              </div>
              
              <!-- Due Date -->
              <div style="color:#64748b; font-size:1em; margin-bottom:20px; display:flex; align-items:center;">
                <span style="display:inline-block; margin-right:8px;">📅</span>
                Due: <span style="font-weight:500; color:#334155; margin-left:4px;">${dueDateStr}</span>
                <span style="margin-left:5px; font-weight:600; color:${urgencyColor};">(${daysText})</span>
              </div>
              
              <!-- Description -->
              ${
                goal.description
                  ? `<div style="color:#475569; margin-bottom:24px; padding:15px; background:#f8fafc; border-radius:8px; font-size:0.95em; border-left:4px solid #818cf8;">
                      ${goal.description}
                    </div>`
                  : ""
              }
              
              <!-- Progress Section -->
              <div style="margin:25px 0 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                  <span style="font-size:1.05em; font-weight:500; color:#334155;">Your Progress</span>
                  <div style="display:flex; align-items:center;">
                    <span style="font-size:1.2em; margin-right:8px;">${progressEmoji}</span>
                    <span style="font-size:1.1em; font-weight:600; color:${
                      progressPercent < 30
                        ? "#ef4444"
                        : progressPercent < 70
                        ? "#f59e0b"
                        : "#10b981"
                    };">${progressPercent}%</span>
                  </div>
                </div>
                
                <!-- Progress Bar -->
                <div style="width:100%; background:#e2e8f0; border-radius:10px; height:10px; overflow:hidden; box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);">
                  <div style="height:100%; background:linear-gradient(to right, #8b5cf6, #6366f1); width:${progressPercent}%; border-radius:10px; transition:width 1s ease-in-out;"></div>
                </div>
              </div>
              
              <!-- Subtasks -->
              ${
                subtasks.length > 0
                  ? `<div style="margin:25px 0 5px;">
                      <h3 style="color:#334155; font-size:1.1em; margin:0 0 12px; font-weight:500; display:flex; align-items:center;">
                        <span style="margin-right:8px;">📋</span> Task Checklist
                      </h3>
                      <ul style="margin:15px 0 0; padding:0; list-style:none;">
                        ${subtasks
                          .map((st, index) => {
                            const randomEmoji =
                              taskEmojis[index % taskEmojis.length];
                            return `<li style="margin-bottom:10px; padding:10px; border-radius:8px; background:${
                              st.completed ? "#f0fdf4" : "#f8fafc"
                            }; display:flex; align-items:center; border:1px solid ${
                              st.completed ? "#dcfce7" : "#f1f5f9"
                            };">
                              <span style="margin-right:10px; font-size:1.1em;">${randomEmoji}</span>
                              <span style="flex:1; font-size:0.95em; color:#334155; ${
                                st.completed
                                  ? "text-decoration:line-through; color:#10b981;"
                                  : "color:#475569;"
                              }">${st.name}</span>
                              ${
                                st.completed
                                  ? '<span style="background:#dcfce7; color:#10b981; font-size:0.7em; font-weight:600; padding:3px 8px; border-radius:20px; margin-left:5px;">DONE</span>'
                                  : ""
                              }
                            </li>`;
                          })
                          .join("")}
                      </ul>
                    </div>`
                  : ""
              }
            </div>
            
            <!-- CTA Button -->
            <div style="text-align:center; margin:30px 0;">
              <a href="https://stride-qd71.onrender.com/goals/${
                goal._id
              }" target="_blank" style="display:inline-block; padding:14px 32px; background:linear-gradient(to right, #6366f1, #8b5cf6); color:#ffffff; border-radius:30px; font-size:1em; text-decoration:none; font-weight:600; letter-spacing:0.3px; transition:all 0.3s ease; box-shadow:0 4px 10px rgba(99, 102, 241, 0.3);">
                View Your Goal
              </a>
            </div>
            
            <!-- Motivation Quote -->
            <div style="margin:35px 20px; padding:25px; background:#f0f9ff; border-radius:12px; text-align:center; position:relative; border:1px dashed #bae6fd;">
              <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:white; padding:0 15px; color:#0ea5e9; font-weight:600; font-size:0.9em;">MOTIVATION BOOST</div>
              <p style="color:#0369a1; font-style:italic; font-size:1.1em; margin:0; padding:0 10px; position:relative; z-index:1;">
                "${quote}"
              </p>
              <div style="position:absolute; top:10px; left:10px; font-size:2em; color:rgba(3, 105, 161, 0.1); z-index:0;">❝</div>
              <div style="position:absolute; bottom:10px; right:10px; font-size:2em; color:rgba(3, 105, 161, 0.1); z-index:0;">❞</div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align:center; padding:25px 30px; border-top:1px solid #e2e8f0; background:#f8fafc; color:#64748b; font-size:0.9em;">
            <p style="margin:0 0 10px;">Keep striding forward and achieving greatness! 🌈</p>
            <p style="margin:0; font-size:0.85em; color:#94a3b8;">This is an automated message from Stride</p>
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

      // In-app notification
      await createGoalReminderNotification({
        userId: user._id,
        goal,
        daysBefore,
      });

      logger.info(`Reminder sent to ${user.email} for goal ${goal._id}`);
    }
  }
  logger.info("Goal reminder job completed");
};
