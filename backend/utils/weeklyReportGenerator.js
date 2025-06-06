// jobs/emailReports/weeklyReportGenerator.js
import User from "../models/userModel.js";
import Goal from "../models/goalModel.js";
import Task from "../models/taskModel.js";
import sendEmail from "../utils/emailService.js";
import logger from "../utils/logger.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

// Function to generate charts as buffer
const generateChartImage = async (data, labels, title) => {
  const width = 600;
  const height = 400;
  const chartCallback = (ChartJS) => {
    ChartJS.defaults.font.family =
      "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
    ChartJS.defaults.font.size = 16;
  };

  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    chartCallback,
  });

  const configuration = {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: data,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 18,
          },
        },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
          },
        },
      },
    },
  };

  // Return buffer instead of data URL
  return await chartJSNodeCanvas.renderToBuffer(configuration);
};

// Function to calculate daily progress based on actual task and goal activities
const calculateDailyProgressData = async (userId, startDate, endDate) => {
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const dailyProgressData = new Array(7).fill(0);

  // Create date objects for each day of the past week
  const dailyDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dailyDates.push(date);
  }

  // Get goals created by this user OR where they are a collaborator
  const userGoals = await Goal.find({
    $or: [{ createdBy: userId }, { collaborators: userId }],
    "duration.startDate": { $lte: endDate },
  });

  const goalIds = userGoals.map((goal) => goal._id);

  // Get tasks for these goals
  const tasks = await Task.find({
    goalId: { $in: goalIds },
    // Look for tasks updated within the report period
    updatedAt: { $gte: startDate, $lte: endDate },
  });

  // Process each task's completion percentage changes by day
  tasks.forEach((task) => {
    // Find which day this task was updated
    const updateDate = new Date(task.updatedAt);
    const dayIndex = dailyDates.findIndex(
      (date) =>
        date.getDate() === updateDate.getDate() &&
        date.getMonth() === updateDate.getMonth() &&
        date.getFullYear() === updateDate.getFullYear()
    );

    if (dayIndex !== -1) {
      // Add the task's completion percentage to that day's progress
      // Distribute the task's contribution proportionally across days
      dailyProgressData[dayIndex] +=
        (task.completionPercentage / tasks.length) * 100;
    }
  });

  // Normalize data to ensure it's within 0-100 range
  const normalizedData = dailyProgressData.map((value) =>
    Math.min(Math.round(value), 100)
  );

  return {
    data: normalizedData,
    labels: weekDays,
  };
};

// Main function to generate and send weekly reports
export const generateAndSendWeeklyReports = async () => {
  try {
    logger.info("Starting weekly productivity report generation");

    // Get all users
    const users = await User.find({});
    logger.debug(`Found ${users.length} users for weekly reports`);

    // Get the date range for the report (past week)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Format dates for display
    const startDateStr = startDate.toDateString();
    const endDateStr = endDate.toDateString();

    for (const user of users) {
      try {
        // Get goals created by this user OR where they are a collaborator
        const userGoals = await Goal.find({
          $or: [{ createdBy: user._id }, { collaborators: user._id }],
          "duration.startDate": { $lte: endDate },
        });

        if (userGoals.length === 0) {
          logger.debug(`No active goals found for user ${user._id}`);
          continue; // Skip users with no goals
        }

        // Get tasks associated with the user's goals
        const goalIds = userGoals.map((goal) => goal._id);
        const tasks = await Task.find({ goalId: { $in: goalIds } });

        // Calculate completion statistics
        const completedGoals = userGoals.filter(
          (goal) => goal.completed
        ).length;
        const goalCompletionRate = (completedGoals / userGoals.length) * 100;

        const completedTasks = tasks.filter((task) => task.completed).length;
        const taskCompletionRate =
          tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

        // Get goals with highest completion percentage
        const topGoals = [...userGoals]
          .sort((a, b) => b.completionPercentage - a.completionPercentage)
          .slice(0, 5);

        // Get ACTUAL daily progress data based on task activities
        const { data: dailyProgress, labels: weekDays } =
          await calculateDailyProgressData(user._id, startDate, endDate);

        // Generate chart buffers
        const goalProgressBuffer = await generateChartImage(
          topGoals.map((goal) => goal.completionPercentage),
          topGoals.map(
            (goal) =>
              goal.title.substring(0, 15) +
              (goal.title.length > 15 ? "..." : "")
          ),
          "Top Goal Progress"
        );

        const weeklyProgressBuffer = await generateChartImage(
          dailyProgress,
          weekDays,
          "Weekly Progress"
        );

        // Generate HTML content for email
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Weekly Productivity Report</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .container {
              max-width: 650px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid #eee;
            }
            .header h1 {
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .header p {
              color: #7f8c8d;
              margin: 0;
            }
            .report-section {
              margin: 25px 0;
            }
            .report-section h2 {
              color: #2c3e50;
              margin-bottom: 15px;
            }
            .stats-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 20px;
              justify-content: space-between;
            }
            .stat-box {
              background-color: #f8f9fa;
              border-radius: 6px;
              padding: 15px;
              flex-basis: calc(50% - 20px);
              box-sizing: border-box;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .stat-value {
              font-size: 28px;
              font-weight: bold;
              color: #3498db;
              margin: 10px 0;
            }
            .chart-container {
              margin: 25px 0;
              text-align: center;
            }
            .chart-container img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #7f8c8d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Weekly Productivity Report</h1>
              <p>${startDateStr} - ${endDateStr}</p>
            </div>
            
            <div class="report-section">
              <h2>Weekly Overview</h2>
              <div class="stats-grid">
                <div class="stat-box">
                  <p>Goal Completion Rate</p>
                  <div class="stat-value">${Math.round(
                    goalCompletionRate
                  )}%</div>
                </div>
                <div class="stat-box">
                  <p>Task Completion Rate</p>
                  <div class="stat-value">${Math.round(
                    taskCompletionRate
                  )}%</div>
                </div>
                <div class="stat-box">
                  <p>Active Goals</p>
                  <div class="stat-value">${userGoals.length}</div>
                </div>
                <div class="stat-box">
                  <p>Active Tasks</p>
                  <div class="stat-value">${tasks.length}</div>
                </div>
              </div>
            </div>
            
            <div class="report-section">
              <h2>Top Performing Goals</h2>
              <div class="chart-container">
                <img src="cid:goalProgressChart" alt="Goal Progress Chart">
              </div>
            </div>
            
            <div class="report-section">
              <h2>Weekly Progress</h2>
              <div class="chart-container">
                <img src="cid:weeklyProgressChart" alt="Weekly Progress Chart">
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated report from Stride. Keep up the good work!</p>
            </div>
          </div>
        </body>
        </html>
        `;

        // Send the email with attachments
        await sendEmail({
          email: user.email,
          subject: "Your Weekly Productivity Report",
          html,
          attachments: [
            {
              filename: "goal-progress.png",
              content: goalProgressBuffer,
              cid: "goalProgressChart",
            },
            {
              filename: "weekly-progress.png",
              content: weeklyProgressBuffer,
              cid: "weeklyProgressChart",
            },
          ],
        });

        logger.info(`Weekly report sent to user ${user._id}`);
      } catch (error) {
        logger.error(`Error generating report for user ${user._id}`, {
          error: error.message,
          stack: error.stack,
        });
        // Continue with next user even if one fails
      }
    }

    logger.info("Weekly report generation completed");
  } catch (error) {
    logger.error("Error in weekly report generation process", {
      error: error.message,
      stack: error.stack,
    });
  }
};
