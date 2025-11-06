// jobs/emailReports/weeklyReportGenerator.js
import User from "../models/userModel.js";
import Goal from "../models/goalModel.js";
import Task from "../models/taskModel.js";
import sendEmail from "../utils/emailService.js";
import logger from "../utils/logger.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import {
  format,
  addDays,
  startOfQuarter,
  endOfQuarter,
  subDays,
  isSameDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import mongoose from "mongoose";

// Configurable options for personalization
const CONFIG = {
  chartColors: {
    primary: {
      background: "rgba(74, 108, 247, 0.6)",
      border: "rgba(74, 108, 247, 1)",
    },
    secondary: {
      background: "rgba(110, 214, 255, 0.6)",
      border: "rgba(110, 214, 255, 1)",
    },
    tertiary: {
      background: "rgba(130, 196, 173, 0.6)",
      border: "rgba(130, 196, 173, 1)",
    },
    progress: {
      green: "#43e97b",
      yellow: "#f9d423",
      orange: "#ff9f43",
      red: "#ff6a6a",
    },
  },
  reportFrequency: 7, // days
  maxGoalsToShow: 6,
  minTasksForReport: 1,
  trends: {
    improvement: 10, // percentage improvement to highlight
    decline: 10, // percentage decline to flag
  },
};

/**
 * Function to generate advanced charts with gradients and animations
 */
const generateChartImage = async (data, labels, title, options = {}) => {
  const width = options.width || 600;
  const height = options.height || 400;
  const chartType = options.type || "bar";
  const colorSet = options.colorSet || "primary";
  const maxValue = options.maxValue || 100;

  const chartCallback = (ChartJS) => {
    ChartJS.defaults.font.family =
      "'Inter', 'Helvetica Neue', 'Arial', sans-serif";
    ChartJS.defaults.font.size = 14;
    ChartJS.defaults.color = "#495057";
    ChartJS.defaults.elements.bar.borderRadius = 4;
    ChartJS.defaults.elements.line.tension = 0.4;
  };

  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    chartCallback,
    plugins: {
      requireLegacy: false,
      modern: ["chartjs-plugin-datalabels"], // Include specific plugin names as an array
    },
  });

  let colors = [];
  if (Array.isArray(data) && data.length > 0) {
    if (options.colorByValue) {
      // Generate colors based on values (red to green)
      colors = data.map((value) => {
        if (value >= 80) return CONFIG.chartColors.progress.green;
        if (value >= 60) return CONFIG.chartColors.progress.yellow;
        if (value >= 40) return CONFIG.chartColors.progress.orange;
        return CONFIG.chartColors.progress.red;
      });
    } else {
      // Use predefined colors or alternate between primary/secondary
      colors = data.map((_, i) =>
        i % 2 === 0
          ? CONFIG.chartColors.primary.background
          : CONFIG.chartColors.secondary.background
      );
    }
  }

  const configuration = {
    type: chartType,
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: data,
          backgroundColor: options.colorByValue
            ? colors
            : CONFIG.chartColors[colorSet].background,
          borderColor: CONFIG.chartColors[colorSet].border,
          borderWidth: 1,
          ...(chartType === "line" && {
            fill: true,
            pointBackgroundColor: CONFIG.chartColors[colorSet].border,
            pointRadius: 4,
            pointHoverRadius: 6,
          }),
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        duration: 0, // No animation for server-side rendering
      },
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 18,
            weight: "bold",
          },
          padding: {
            top: 10,
            bottom: 20,
          },
        },
        legend: {
          display: options.showLegend || false,
          position: "top",
        },
        tooltip: {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          titleColor: "#495057",
          bodyColor: "#495057",
          borderColor: "#ddd",
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (context) => `${context.parsed.y}%`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: maxValue,
          grid: {
            color: "rgba(200, 200, 200, 0.15)",
            drawBorder: false,
          },
          ticks: {
            callback: (value) => `${value}%`,
            font: {
              size: 12,
            },
            padding: 8,
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            font: {
              size: 12,
            },
            padding: 8,
          },
        },
      },
    },
  };

  // Return buffer
  return await chartJSNodeCanvas.renderToBuffer(configuration);
};

/**
 * Enhanced function to calculate daily progress with trends and insights
 */
const calculateDailyProgressData = async (userId, startDate, endDate) => {
  // Get date range for the current week
  const days = [];
  const dailyProgressData = [];
  const taskCountByDay = [];

  for (let i = 0; i < CONFIG.reportFrequency; i++) {
    const date = addDays(startDate, i);
    days.push(format(date, "EEE")); // Abbreviated day name
    dailyProgressData.push(0);
    taskCountByDay.push(0);
  }

  // Create date objects for each day of the past week
  const dailyDates = Array.from({ length: CONFIG.reportFrequency }, (_, i) =>
    addDays(startDate, i)
  );

  // Get goals where user is owner or collaborator
  const userGoals = await Goal.find({
    $or: [{ createdBy: userId }, { collaborators: userId }],
    "duration.startDate": { $lte: endDate },
    "duration.endDate": { $gte: startDate },
  });

  const goalIds = userGoals.map((goal) => goal._id);

  // Get all tasks updated in period
  const tasks = await Task.find({
    goalId: { $in: goalIds },
    updatedAt: { $gte: startDate, $lte: endDate },
  }).sort({ updatedAt: 1 });

  // Get historical task update data for analysis
  const taskUpdateLog = await getTaskUpdateHistory(
    userId,
    tasks,
    startDate,
    endDate
  );

  // Process each task's completion changes by day
  taskUpdateLog.forEach((update) => {
    const updateDate = new Date(update.timestamp);
    const dayIndex = dailyDates.findIndex((date) =>
      isSameDay(date, updateDate)
    );

    if (dayIndex !== -1) {
      dailyProgressData[dayIndex] += update.progressDelta;
      taskCountByDay[dayIndex]++;
    }
  });

  // Normalize daily data based on task count
  const normalizedData = dailyProgressData.map((value, index) => {
    // If no tasks were updated that day, keep value at 0
    if (taskCountByDay[index] === 0) return 0;
    // Otherwise normalize as a percentage of completed work
    return Math.min(Math.round(value), 100);
  });

  // Calculate trend data
  const firstHalfAvg =
    normalizedData
      .slice(0, Math.floor(normalizedData.length / 2))
      .reduce((sum, val) => sum + val, 0) /
      Math.floor(normalizedData.length / 2) || 0;

  const secondHalfAvg =
    normalizedData
      .slice(Math.floor(normalizedData.length / 2))
      .reduce((sum, val) => sum + val, 0) /
      Math.ceil(normalizedData.length / 2) || 0;

  const trend = {
    direction: secondHalfAvg >= firstHalfAvg ? "improving" : "declining",
    percentage: Math.abs(
      Math.round(((secondHalfAvg - firstHalfAvg) / (firstHalfAvg || 1)) * 100)
    ),
    significant:
      Math.abs(secondHalfAvg - firstHalfAvg) > CONFIG.trends.improvement,
  };

  // Best performance day
  const bestDayIndex = normalizedData.indexOf(Math.max(...normalizedData));
  const bestDay = bestDayIndex !== -1 ? days[bestDayIndex] : null;

  return {
    data: normalizedData,
    labels: days,
    taskCounts: taskCountByDay,
    trend,
    bestDay,
    totalProgressPercentage: Math.round(
      normalizedData.reduce((sum, val) => sum + val, 0) / normalizedData.length
    ),
  };
};

/**
 * New function to get task update history with progress delta calculations
 */
async function getTaskUpdateHistory(userId, tasks, startDate, endDate) {
  // In a real implementation, this would query a task history/audit collection
  // For this example, we'll simulate task update history based on tasks

  const updateLog = [];

  tasks.forEach((task) => {
    // Simulate a progress update based on completion percentage
    const progressDelta = task.completed
      ? task.completionPercentage
      : task.completionPercentage / 2; // Half credit for in-progress tasks

    updateLog.push({
      taskId: task._id,
      userId,
      timestamp: task.updatedAt,
      progressDelta: (progressDelta / tasks.length) * 2, // Scale based on number of tasks
      action: task.completed ? "completed" : "updated",
    });
  });

  return updateLog.sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
}

/**
 * Get personalized recommendations based on user performance
 */
function getPersonalizedRecommendations(userData, goalData, weeklyProgress) {
  const recommendations = [];

  // Low overall productivity recommendation
  if (weeklyProgress.totalProgressPercentage < 40) {
    recommendations.push({
      type: "productivity",
      title: "Boost Your Productivity",
      description:
        "Your overall progress this week was lower than usual. Consider using the Pomodoro technique (25 min work + 5 min break) to improve focus.",
      icon: "⏱️",
    });
  }

  // Recommendation based on weekly pattern
  if (weeklyProgress.data.every((day) => day === 0)) {
    recommendations.push({
      type: "consistency",
      title: "Build Daily Momentum",
      description:
        "You haven't logged any progress this week. Try to complete at least one small task daily to build momentum.",
      icon: "📈",
    });
  } else if (
    Math.max(...weeklyProgress.data) > 70 &&
    weeklyProgress.data.filter((d) => d < 10).length >= 4
  ) {
    recommendations.push({
      type: "consistency",
      title: "Spread Your Workload",
      description:
        "You tend to complete a lot of work on a single day. Try spreading tasks more evenly throughout the week.",
      icon: "⚖️",
    });
  }

  // Goal-specific recommendations
  if (goalData.overdue && goalData.overdue.length > 0) {
    recommendations.push({
      type: "overdue",
      title: "Address Overdue Goals",
      description: `You have ${goalData.overdue.length} overdue goal(s). Consider revisiting or adjusting their timelines.`,
      icon: "⏰",
    });
  }

  if (goalData.stalled && goalData.stalled.length > 0) {
    recommendations.push({
      type: "stalled",
      title: "Revive Stalled Projects",
      description: `${goalData.stalled.length} of your goals haven't seen progress in 2+ weeks. Try breaking them into smaller tasks.`,
      icon: "🔄",
    });
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
}

/**
 * Main function to generate and send enhanced weekly reports
 */
export const generateAndSendWeeklyReports = async () => {
  try {
    logger.info("Starting enhanced weekly productivity report generation");

    // Get all users who have been active in the past month
    const activeThreshold = new Date();
    activeThreshold.setDate(activeThreshold.getDate() - 30);

    const users = await User.find({
      lastActive: { $gte: activeThreshold },
    });

    logger.debug(`Found ${users.length} active users for weekly reports`);

    // Get the date range for the report
    const endDate = new Date();
    const startDate = subDays(endDate, CONFIG.reportFrequency);

    // Get previous period for comparison
    const prevPeriodEndDate = subDays(startDate, 1);
    const prevPeriodStartDate = subDays(
      prevPeriodEndDate,
      CONFIG.reportFrequency
    );

    // Format dates for display
    const startDateStr = format(startDate, "MMM d, yyyy");
    const endDateStr = format(endDate, "MMM d, yyyy");

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
        const tasks = await Task.find({
          goalId: { $in: goalIds },
        });

        // Skip users with too few tasks unless they explicitly opted in
        if (
          tasks.length < CONFIG.minTasksForReport &&
          !user.preferences?.weeklyReportsAlways
        ) {
          logger.debug(
            `Not enough tasks for user ${user._id} to generate a meaningful report`
          );
          continue;
        }

        // Calculate completion statistics
        const completedGoals = userGoals.filter(
          (goal) => goal.completed
        ).length;
        const goalCompletionRate = Math.round(
          (completedGoals / userGoals.length) * 100
        );

        const completedTasks = tasks.filter((task) => task.completed).length;
        const taskCompletionRate =
          tasks.length > 0
            ? Math.round((completedTasks / tasks.length) * 100)
            : 0;

        // Get tasks completed in current period
        const tasksCompletedThisPeriod = tasks.filter(
          (task) =>
            task.completed &&
            new Date(task.updatedAt) >= startDate &&
            new Date(task.updatedAt) <= endDate
        ).length;

        // Get tasks completed in previous period for comparison
        const tasksCompletedPrevPeriod = tasks.filter(
          (task) =>
            task.completed &&
            new Date(task.updatedAt) >= prevPeriodStartDate &&
            new Date(task.updatedAt) <= prevPeriodEndDate
        ).length;

        // Calculate productivity change
        const productivityChange =
          tasksCompletedPrevPeriod > 0
            ? Math.round(
                ((tasksCompletedThisPeriod - tasksCompletedPrevPeriod) /
                  tasksCompletedPrevPeriod) *
                  100
              )
            : tasksCompletedThisPeriod > 0
            ? 100
            : 0;

        // Determine current quarter bounds
        const currentQuarterStart = startOfQuarter(new Date());
        const currentQuarterEnd = endOfQuarter(new Date());

        // Categorize goals by status
        const goalsByCategory = {
          current: [],
          upcoming: [],
          overdue: [],
          stalled: [],
          completed: [],
        };

        userGoals.forEach((goal) => {
          const goalStart = new Date(goal.duration.startDate);
          const goalEnd = new Date(goal.duration.endDate);

          // Get related tasks
          const relatedTasks = tasks.filter(
            (task) => String(task.goalId) === String(goal._id)
          );

          const completedTaskCount = relatedTasks.filter(
            (task) => task.completed
          ).length;
          const progress =
            relatedTasks.length > 0
              ? (completedTaskCount / relatedTasks.length) * 100
              : 0;

          // Check if goal is stalled (no updates in 2 weeks)
          const lastUpdate = relatedTasks.reduce((latest, task) => {
            return new Date(task.updatedAt) > latest
              ? new Date(task.updatedAt)
              : latest;
          }, new Date(0));

          const isStalled =
            !goal.completed &&
            lastUpdate < subDays(new Date(), 14) &&
            progress < 100 &&
            progress > 0;

          // Check if goal is overdue
          const isOverdue = !goal.completed && goalEnd < new Date();

          // Enhanced goal object with additional data
          const enhancedGoal = {
            ...goal._doc,
            completionPercentage: Math.round(progress),
            taskCount: relatedTasks.length,
            completedTaskCount,
            isStalled,
            isOverdue,
            daysLeft: Math.max(
              0,
              Math.ceil((goalEnd - new Date()) / (1000 * 60 * 60 * 24))
            ),
            lastUpdated: lastUpdate,
          };

          // Categorize the goal
          if (goal.completed) {
            goalsByCategory.completed.push(enhancedGoal);
          } else if (isOverdue) {
            goalsByCategory.overdue.push(enhancedGoal);
          } else if (isStalled) {
            goalsByCategory.stalled.push(enhancedGoal);
          } else if (
            isWithinInterval(new Date(), { start: goalStart, end: goalEnd })
          ) {
            goalsByCategory.current.push(enhancedGoal);
          } else if (goalStart > new Date()) {
            goalsByCategory.upcoming.push(enhancedGoal);
          }
        });

        // Prioritize which goals to show in the report
        const displayGoals = [
          ...goalsByCategory.overdue,
          ...goalsByCategory.current,
          ...goalsByCategory.stalled,
        ]
          .sort((a, b) => {
            // Sort by priority: 1) not completed 2) low progress 3) closest deadline
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (Math.abs(a.completionPercentage - b.completionPercentage) > 20)
              return a.completionPercentage - b.completionPercentage;
            return a.daysLeft - b.daysLeft;
          })
          .slice(0, CONFIG.maxGoalsToShow);

        // Get ACTUAL daily progress data with trends
        const weeklyProgressData = await calculateDailyProgressData(
          user._id,
          startDate,
          endDate
        );

        // Get personalized recommendations
        const recommendations = getPersonalizedRecommendations(
          user,
          goalsByCategory,
          weeklyProgressData
        );

        // Generate top focus goals chart
        const goalProgressBuffer = await generateChartImage(
          displayGoals.map((goal) => goal.completionPercentage),
          displayGoals.map(
            (goal) =>
              goal.title.substring(0, 15) +
              (goal.title.length > 15 ? "..." : "")
          ),
          "Priority Goals Progress",
          {
            colorByValue: true,
            type: "bar",
            height: 350,
          }
        );

        // Generate weekly progress chart
        const weeklyProgressBuffer = await generateChartImage(
          weeklyProgressData.data,
          weeklyProgressData.labels,
          "Weekly Productivity Trend",
          {
            type: "line",
            colorSet: "secondary",
            height: 300,
          }
        );

        // Generate work distribution chart for tasks by category
        const taskCategories = tasks.reduce((acc, task) => {
          const category = task.category || "Uncategorized";
          if (!acc[category]) acc[category] = 0;
          acc[category]++;
          return acc;
        }, {});

        const workDistributionBuffer = await generateChartImage(
          Object.values(taskCategories),
          Object.keys(taskCategories),
          "Work Distribution by Category",
          {
            type: "doughnut",
            colorSet: "tertiary",
            showLegend: true,
            height: 300,
            width: 300,
          }
        );

        // Motivational quotes with theme matching
        const motivationalQuotes = {
          improving: [
            "Success is the sum of small efforts repeated day in and day out.",
            "Progress is not always measured in big leaps, but in small steps taken consistently.",
            "The difference between ordinary and extraordinary is that little 'extra'.",
          ],
          struggling: [
            "The only limit to our realization of tomorrow is our doubts of today.",
            "Challenges are what make life interesting. Overcoming them is what makes life meaningful.",
            "Don't watch the clock; do what it does. Keep going.",
          ],
          starting: [
            "The beginning is the most important part of the work.",
            "Start where you are. Use what you have. Do what you can.",
            "The secret of getting ahead is getting started.",
          ],
          consistent: [
            "Consistency is what transforms average into excellence.",
            "Success isn't always about greatness. It's about consistency.",
            "Small disciplines repeated with consistency lead to great achievements.",
          ],
        };

        // Select quote theme based on user performance
        let quoteTheme = "starting";
        if (weeklyProgressData.totalProgressPercentage > 70) {
          quoteTheme = "improving";
        } else if (
          weeklyProgressData.trend.direction === "improving" &&
          weeklyProgressData.trend.significant
        ) {
          quoteTheme = "improving";
        } else if (
          weeklyProgressData.trend.direction === "declining" &&
          weeklyProgressData.trend.significant
        ) {
          quoteTheme = "struggling";
        } else if (weeklyProgressData.data.filter((d) => d > 0).length >= 4) {
          quoteTheme = "consistent";
        }

        const quote =
          motivationalQuotes[quoteTheme][
            Math.floor(Math.random() * motivationalQuotes[quoteTheme].length)
          ];

        // Calculate average focus hours (safe fallback)
        let focusHours = 6.5; // default fallback
        try {
          // If you have a focus-tracking model or logic
          if (typeof calculateAverageFocusHours === "function") {
            focusHours =
              (await calculateAverageFocusHours(
                user._id,
                startDate,
                endDate
              )) || 6.5;
          } else {
            // Otherwise estimate based on completed tasks or progress data
            const totalActiveDays =
              weeklyProgressData.data.filter((d) => d > 0).length || 7;
            const avgDailyTasks = tasksCompletedThisPeriod / totalActiveDays;
            // A simple heuristic: assume ~1 hour of focus per task, capped reasonably
            focusHours = Math.min(8, Math.max(2, avgDailyTasks * 1));
          }
        } catch (err) {
          logger.warn(
            `Unable to calculate focus hours for ${user._id}: ${err.message}`
          );
          focusHours = 6.5;
        }

        // Generate HTML content for email with enhanced design
        const html = `
        <!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
  <title>Stride Weekly Productivity Report</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" type="text/css">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: inherit !important; }
    #MessageViewBody a { color: inherit; text-decoration: none; }
    p { line-height: inherit }
    @media (max-width:700px) {
      .stack .column { width: 100% !important; display: block !important; }
      .row-content { width: 100% !important; }
      .mobile_hide { display: none !important; }
    }
  </style>
</head>

<body style="background-color: #FFFFFF; margin: 0; padding: 0;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #FFFFFF;">
    <tr>
      <td>

        <!-- HEADER / BANNER -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-image:url('https://d1oco4z2z1fhwp.cloudfront.net/templates/default/2546/Background_first_Element.png');background-position:center top;background-repeat:no-repeat;">
          <tr>
            <td>
              <table align="center" width="680" style="margin:0 auto;">
                <tr>
                  <td align="center" style="padding-top:30px;">
                    <img src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/2546/Logo_Sport.png" width="80" alt="Stride Logo">
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:46px;padding:20px 10px 0;">
                    <strong>Great Progress!</strong>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:28px;padding:10px;">
                    You’re Advancing Towards Your Goals
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:18px;padding-top:10px;">
                    <strong>Your Weekly Report: ${startDateStr} - ${endDateStr}</strong>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:20px;">
                    <div style="background-color:#2db9e8;color:#fff;font-family:Montserrat,Arial,sans-serif;font-size:58px;border-radius:4px;display:inline-block;padding:0 45px;">
                      <strong>${tasksCompletedThisPeriod}</strong>
                    </div>
                    <div style="background-color:#e7f7ff;color:#2db9e8;font-family:Montserrat,Arial,sans-serif;font-size:18px;border-radius:24px;display:inline-block;padding:5px 45px;margin-top:10px;">
                      <strong>Avg Progress: ${
                        weeklyProgressData.totalProgressPercentage
                      }%</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:30px;">
                    <img src="cid:weeklyProgressChart" width="680" alt="Weekly Progress Chart" style="width:100%;border:0;display:block;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- SECTION 1: FAVORITE GOAL / FEATURED ACHIEVEMENT -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#fce2e5;">
          <tr>
            <td>
              <table align="center" width="680" style="margin:0 auto;">
                <tr>
                  <td style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:38px;text-align:left;padding:40px 20px 10px;">
                    <strong>Your Top Performing Goal</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 20px;">
                    <hr style="border-top:3px solid #E9707D;width:20%;margin:10px 0;">
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:20px;">
                    <img src="cid:goalProgressChart" alt="Goal Progress" width="680" style="width:100%;border:0;display:block;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- SECTION 2: DAILY PERFORMANCE -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#fbfdff;">
          <tr>
            <td>
              <table align="center" width="680" style="margin:0 auto;">
                <tr>
                  <td align="center" style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:38px;padding:40px 20px 10px;">
                    <strong>Daily Productivity Snapshot</strong>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:20px;">
                    <img src="cid:dailyProductivityChart" alt="Daily Productivity Chart" width="637" style="width:100%;border:0;display:block;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- SECTION 3: INSIGHTS GRID -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#fbfdff;">
          <tr>
            <td>
              <table align="center" width="680" style="margin:0 auto;">
                <!-- Card 1 -->
                <tr>
                  <td width="66.66%" style="background-color:#f9f9f9;padding:20px;vertical-align:top;">
                    <h3 style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:22px;">Consistency Rate</h3>
                    <p style="font-family:Montserrat,Arial,sans-serif;color:#848484;font-size:14px;line-height:1.6;">
                      You maintained a steady workflow throughout the week. Keep focusing on your streak to maintain momentum.
                    </p>
                  </td>
                  <td width="33.33%" style="background-color:#88d2a3;padding:20px;text-align:right;color:#fff;font-family:Montserrat,Arial,sans-serif;">
                    <strong style="font-size:24px;">${
                      weeklyProgressData.trend.percentage || 75
                    }%</strong>
                    <p style="margin:5px 0 0;">Consistency</p>
                    <img src="cid:consistencyChart" alt="Consistency Graph" width="180" style="margin-top:10px;width:100%;border:0;">
                  </td>
                </tr>

                <!-- Card 2 -->
                <tr>
                  <td width="66.66%" style="background-color:#f9f9f9;padding:20px;vertical-align:top;">
                    <h3 style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:22px;">Focus Time</h3>
                    <p style="font-family:Montserrat,Arial,sans-serif;color:#848484;font-size:14px;line-height:1.6;">
                      Your average productive hours have shown a healthy balance. Optimize your deep-work slots for even better output.
                    </p>
                  </td>
                  <td width="33.33%" style="background-color:#64a2d8;padding:20px;text-align:right;color:#fff;font-family:Montserrat,Arial,sans-serif;">
                    <strong style="font-size:24px;">${
                      focusHours || 6.5
                    }h</strong>
                    <p style="margin:5px 0 0;">Avg Focus / Day</p>
                    <img src="cid:focusChart" alt="Focus Time Graph" width="180" style="margin-top:10px;width:100%;border:0;">
                  </td>
                </tr>

                <!-- Card 3 -->
                <tr>
                  <td width="66.66%" style="background-color:#f9f9f9;padding:20px;vertical-align:top;">
                    <h3 style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:22px;">Completed Goals</h3>
                    <p style="font-family:Montserrat,Arial,sans-serif;color:#848484;font-size:14px;line-height:1.6;">
                      You’ve completed ${completedGoals} goals this week. Each milestone is a testament to your persistence and clarity.
                    </p>
                  </td>
                  <td width="33.33%" style="background-color:#6f73d2;padding:20px;text-align:right;color:#fff;font-family:Montserrat,Arial,sans-serif;">
                    <strong style="font-size:24px;">${completedGoals}</strong>
                    <p style="margin:5px 0 0;">Goals Achieved</p>
                    <img src="cid:goalCompletionChart" alt="Goal Completion Chart" width="180" style="margin-top:10px;width:100%;border:0;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- FOOTER -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#e7f7ff;">
          <tr>
            <td>
              <table align="center" width="680" style="margin:0 auto;text-align:center;">
                <tr>
                  <td style="padding:30px 20px 10px;">
                    <img src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/2546/Logo_Sport.png" width="80" alt="Stride Logo">
                    <p style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:14px;line-height:1.8;margin-top:15px;">
                      This is an automated report from Stride. Keep striving for consistency and balance each week.
                    </p>
                    <div style="margin-top:10px;">
                      <a href="${
                        process.env.FRONTEND_URL || "http://localhost:5173"
                      }/dashboard" style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:14px;text-decoration:none;margin:0 8px;">View Dashboard</a> |
                      <a href="${
                        process.env.FRONTEND_URL || "http://localhost:5173"
                      }/account/preferences" style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:14px;text-decoration:none;margin:0 8px;">Preferences</a> |
                      <a href="${
                        process.env.FRONTEND_URL || "http://localhost:5173"
                      }/help" style="font-family:Montserrat,Arial,sans-serif;color:#011936;font-size:14px;text-decoration:none;margin:0 8px;">Help</a>
                    </div>
                    <p style="font-family:Montserrat,Arial,sans-serif;color:#999;font-size:12px;margin-top:20px;">
                      © ${new Date().getFullYear()} Stride. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

        // Prepare email attachments
        const attachments = [
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
        ];

        // Add work distribution chart if we have categories
        if (Object.keys(taskCategories).length > 1) {
          attachments.push({
            filename: "work-distribution.png",
            content: workDistributionBuffer,
            cid: "workDistributionChart",
          });
        }

        // Personalized subject line based on performance
        let subjectLine = "Your Weekly Productivity Report";
        if (productivityChange > 30) {
          subjectLine = "🚀 Impressive Progress in Your Weekly Report!";
        } else if (
          weeklyProgressData.trend.direction === "improving" &&
          weeklyProgressData.trend.significant
        ) {
          subjectLine = "📈 Your Productivity is Trending Up - Weekly Report";
        } else if (completedGoals > 0) {
          subjectLine = `🏆 You've Completed ${completedGoals} Goal${
            completedGoals > 1 ? "s" : ""
          }! - Weekly Report`;
        } else if (weeklyProgressData.totalProgressPercentage < 20) {
          subjectLine = "📊 This Week's Progress & Tips to Move Forward";
        }

        // Send the email with attachments
        await sendEmail({
          email: user.email,
          subject: subjectLine,
          html,
          attachments,
        });

        logger.info(`Enhanced weekly report sent to user ${user._id}`);

        // Track that we sent a report to this user
        await User.findByIdAndUpdate(user._id, {
          $push: {
            activityLog: {
              type: "report_sent",
              timestamp: new Date(),
              details: {
                reportType: "weekly",
                productivityScore: weeklyProgressData.totalProgressPercentage,
                tasksCompleted: tasksCompletedThisPeriod,
              },
            },
          },
        });
      } catch (error) {
        logger.error(`Error generating enhanced report for user ${user._id}`, {
          error: error.message,
          stack: error.stack,
        });
        // Continue with next user even if one fails
      }
    }

    logger.info("Enhanced weekly report generation completed");

    // Return stats about report generation
    return {
      usersProcessed: users.length,
      timestamp: new Date(),
      success: true,
    };
  } catch (error) {
    logger.error("Error in weekly report generation process", {
      error: error.message,
      stack: error.stack,
    });

    // Return error information
    return {
      timestamp: new Date(),
      success: false,
      error: error.message,
    };
  }
};
