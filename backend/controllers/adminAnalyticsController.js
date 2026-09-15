import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import Task from "../models/taskModel.js";
import Goal from "../models/goalModel.js";
import AiLog from "../models/aiLogModel.js";
import RateLimitLog from "../models/rateLimitLogModel.js";
import SystemHealthLog from "../models/systemHealthLogModel.js";
import WeeklyReport from "../models/weeklyReportModel.js";

// @desc    Get engagement analytics (DAU/WAU, cohort retention, streak & level distributions)
// @route   GET /api/admin/analytics/engagement
// @access  Private/Admin
export const getEngagementAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 1. Basic Counts
  const totalUsers = await User.countDocuments();

  // 2. Active users (DAU / WAU / MAU)
  // Combine User.lastActive and Task completion timestamps
  const [activeUsers24h, activeUsers7d, activeUsers30d, taskUsers24h, taskUsers7d] =
    await Promise.all([
      User.distinct("_id", { lastActive: { $gte: dayAgo } }),
      User.distinct("_id", { lastActive: { $gte: weekAgo } }),
      User.distinct("_id", { lastActive: { $gte: monthAgo } }),
      Task.distinct("createdBy", { completed: true, updatedAt: { $gte: dayAgo } }),
      Task.distinct("createdBy", { completed: true, updatedAt: { $gte: weekAgo } }),
    ]);

  const dauSet = new Set([...activeUsers24h.map(String), ...taskUsers24h.map(String)]);
  const wauSet = new Set([...activeUsers7d.map(String), ...taskUsers7d.map(String)]);
  const mauSet = new Set(activeUsers30d.map(String));

  const dau = dauSet.size;
  const wau = wauSet.size;
  const mau = Math.max(mauSet.size, wau);
  const stickiness = wau > 0 ? Number(((dau / wau) * 100).toFixed(1)) : 0;

  // 3. 14-Day Activity Trend (Task completions & active task completers per day)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const dailyTasks = await Task.aggregate([
    {
      $match: {
        completed: true,
        updatedAt: { $gte: fourteenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
        completions: { $sum: 1 },
        uniqueUsers: { $addToSet: "$createdBy" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in gaps for 14 days
  const activityTrend = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const found = dailyTasks.find((t) => t._id === dateStr);
    activityTrend.push({
      date: dateStr,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completions: found ? found.completions : 0,
      activeUsers: found ? found.uniqueUsers.length : 0,
    });
  }

  // 4. Streak Distribution
  const streakStats = await User.aggregate([
    {
      $facet: {
        distribution: [
          {
            $bucket: {
              groupBy: { $ifNull: ["$streak", 0] },
              boundaries: [0, 1, 3, 7, 14, 30, Infinity],
              default: "Other",
              output: { count: { $sum: 1 } },
            },
          },
        ],
        metrics: [
          {
            $group: {
              _id: null,
              maxStreak: { $max: "$streak" },
              avgStreak: { $avg: "$streak" },
            },
          },
        ],
      },
    },
  ]);

  const streakLabels = {
    0: "0 days",
    1: "1-2 days",
    3: "3-6 days",
    7: "7-13 days",
    14: "14-29 days",
    30: "30+ days",
  };

  const rawBuckets = streakStats[0]?.distribution || [];
  const streakBuckets = [0, 1, 3, 7, 14, 30].map((boundary) => {
    const found = rawBuckets.find((b) => b._id === boundary);
    return {
      bucket: streakLabels[boundary],
      count: found ? found.count : 0,
    };
  });

  const maxStreak = streakStats[0]?.metrics[0]?.maxStreak || 0;
  const avgStreak = Number((streakStats[0]?.metrics[0]?.avgStreak || 0).toFixed(1));

  // 5. XP and Level Distribution
  const [levelAggregation, xpAggregation] = await Promise.all([
    User.aggregate([
      {
        $bucket: {
          groupBy: { $ifNull: ["$level", 1] },
          boundaries: [1, 2, 5, 10, 20, Infinity],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    User.aggregate([
      {
        $bucket: {
          groupBy: { $ifNull: ["$xp", 0] },
          boundaries: [0, 100, 500, 1000, 2500, Infinity],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]),
  ]);

  const levelLabels = {
    1: "Level 1",
    2: "Level 2-4",
    5: "Level 5-9",
    10: "Level 10-19",
    20: "Level 20+",
  };

  const levelDistribution = [1, 2, 5, 10, 20].map((b) => {
    const match = levelAggregation.find((x) => x._id === b);
    return {
      tier: levelLabels[b],
      count: match ? match.count : 0,
    };
  });

  const xpLabels = {
    0: "0 - 99 XP",
    100: "100 - 499 XP",
    500: "500 - 999 XP",
    1000: "1,000 - 2,499 XP",
    2500: "2,500+ XP",
  };

  const xpDistribution = [0, 100, 500, 1000, 2500].map((b) => {
    const match = xpAggregation.find((x) => x._id === b);
    return {
      tier: xpLabels[b],
      count: match ? match.count : 0,
    };
  });

  // 6. Retention by Signup Cohort (Weekly cohorts for the last 6 weeks)
  const cohortWeeks = [];
  for (let w = 5; w >= 0; w--) {
    const start = new Date(now);
    start.setDate(now.getDate() - (w + 1) * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setDate(now.getDate() - w * 7);
    end.setHours(23, 59, 59, 999);

    cohortWeeks.push({
      label: `W-${w === 0 ? "Current" : w} (${start.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
      })})`,
      start,
      end,
    });
  }

  const signupCohorts = await Promise.all(
    cohortWeeks.map(async (c) => {
      const cohortUsers = await User.find({
        createdAt: { $gte: c.start, $lte: c.end },
      }).select("_id createdAt lastActive lastTaskCompletedDate");

      const size = cohortUsers.length;
      if (size === 0) {
        return {
          cohort: c.label,
          size: 0,
          retainedWeek1: 0,
          retainedWeek2: 0,
          currentlyActive: 0,
          retentionRate: 0,
        };
      }

      // Active in last 7 days
      const currentlyActive = cohortUsers.filter((u) => {
        const last = u.lastActive ? new Date(u.lastActive).getTime() : 0;
        return last >= weekAgo.getTime();
      }).length;

      // Retained 7+ days after signup
      const retainedWeek1 = cohortUsers.filter((u) => {
        const created = new Date(u.createdAt).getTime();
        const last = u.lastActive ? new Date(u.lastActive).getTime() : 0;
        return last - created >= 7 * 24 * 60 * 60 * 1000;
      }).length;

      // Retained 14+ days after signup
      const retainedWeek2 = cohortUsers.filter((u) => {
        const created = new Date(u.createdAt).getTime();
        const last = u.lastActive ? new Date(u.lastActive).getTime() : 0;
        return last - created >= 14 * 24 * 60 * 60 * 1000;
      }).length;

      return {
        cohort: c.label,
        size,
        retainedWeek1,
        retainedWeek2,
        currentlyActive,
        retentionRate: Number(((currentlyActive / size) * 100).toFixed(1)),
      };
    })
  );

  res.json({
    overview: {
      totalUsers,
      dau,
      wau,
      mau,
      stickiness,
      maxStreak,
      avgStreak,
    },
    activityTrend,
    streakBuckets,
    levelDistribution,
    xpDistribution,
    signupCohorts,
  });
});

// @desc    Get feature usage analytics (Collaborators, Pomodoro, AI coach)
// @route   GET /api/admin/analytics/feature-usage
// @access  Private/Admin
export const getFeatureUsageAnalytics = asyncHandler(async (req, res) => {
  // 1. Goal Collaboration breakdown
  const [totalGoals, soloGoals, collabGoals, collabDistribution] =
    await Promise.all([
      Goal.countDocuments(),
      Goal.countDocuments({
        $or: [{ collaborators: { $size: 0 } }, { collaborators: { $exists: false } }],
      }),
      Goal.countDocuments({ "collaborators.0": { $exists: true } }),
      Goal.aggregate([
        { $match: { "collaborators.0": { $exists: true } } },
        {
          $project: {
            collabCount: { $size: "$collaborators" },
          },
        },
        {
          $bucket: {
            groupBy: "$collabCount",
            boundaries: [1, 2, 3, 5, Infinity],
            default: "Other",
            output: { count: { $sum: 1 } },
          },
        },
      ]),
    ]);

  const collabBuckets = [
    { label: "1 collaborator", count: collabDistribution.find((b) => b._id === 1)?.count || 0 },
    { label: "2 collaborators", count: collabDistribution.find((b) => b._id === 2)?.count || 0 },
    { label: "3-4 collaborators", count: collabDistribution.find((b) => b._id === 3)?.count || 0 },
    { label: "5+ collaborators", count: collabDistribution.find((b) => b._id === 5)?.count || 0 },
  ];

  const soloPercentage =
    totalGoals > 0 ? Number(((soloGoals / totalGoals) * 100).toFixed(1)) : 0;
  const collabPercentage =
    totalGoals > 0 ? Number(((collabGoals / totalGoals) * 100).toFixed(1)) : 0;

  // 2. Pomodoro Adoption
  const [totalUsers, pomodoroUsers, pomodoroStats, topPomodoroUsers] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ totalPomodorosCompleted: { $gt: 0 } }),
      User.aggregate([
        { $match: { totalPomodorosCompleted: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: "$totalPomodorosCompleted" },
            avgSessions: { $avg: "$totalPomodorosCompleted" },
            maxSessions: { $max: "$totalPomodorosCompleted" },
          },
        },
      ]),
      User.find({ totalPomodorosCompleted: { $gt: 0 } })
        .sort({ totalPomodorosCompleted: -1 })
        .limit(5)
        .select("name email totalPomodorosCompleted streak xp level"),
    ]);

  const totalPomodoroSessions = pomodoroStats[0]?.totalSessions || 0;
  const avgPomodoroSessions = Number((pomodoroStats[0]?.avgSessions || 0).toFixed(1));
  const pomodoroAdoptionRate =
    totalUsers > 0 ? Number(((pomodoroUsers / totalUsers) * 100).toFixed(1)) : 0;

  // 3. AI Coach Usage
  const [
    totalAiCalls,
    successfulAiCalls,
    simulatedFallbackCalls,
    geminiFallbackCalls,
    errorAiCalls,
    uniqueAiUsers,
    avgLatencyStats,
    recentAiLogs,
  ] = await Promise.all([
    AiLog.countDocuments(),
    AiLog.countDocuments({ status: "success" }),
    AiLog.countDocuments({ model: "simulated" }),
    AiLog.countDocuments({ status: "fallback_simulated", model: "gemini-2.5-flash" }),
    AiLog.countDocuments({ status: "error" }),
    AiLog.distinct("userId", { userId: { $ne: null } }),
    AiLog.aggregate([
      { $match: { latencyMs: { $gt: 0 } } },
      { $group: { _id: null, avgLatency: { $avg: "$latencyMs" } } },
    ]),
    AiLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name email")
      .populate("goalId", "title"),
  ]);

  const fallbackAiCalls = simulatedFallbackCalls + geminiFallbackCalls;
  const avgAiLatencyMs = Math.round(avgLatencyStats[0]?.avgLatency || 0);

  res.json({
    goalCollaboration: {
      totalGoals,
      soloGoals,
      collabGoals,
      soloPercentage,
      collabPercentage,
      collabBuckets,
    },
    pomodoro: {
      totalUsers,
      pomodoroUsers,
      pomodoroAdoptionRate,
      totalPomodoroSessions,
      avgPomodoroSessions,
      topPomodoroUsers,
    },
    aiCoach: {
      totalAiCalls,
      successfulAiCalls,
      fallbackAiCalls,
      simulatedFallbackCalls,
      geminiFallbackCalls,
      errorAiCalls,
      uniqueUsersCount: uniqueAiUsers.length,
      avgAiLatencyMs,
      recentLogs: recentAiLogs,
    },
  });
});

// @desc    Get rate-limit abuse & visibility analytics
// @route   GET /api/admin/analytics/security
// @access  Private/Admin
export const getSecurityAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalBlocks24h,
    totalBlocks7d,
    totalBlocksAllTime,
    limiterBreakdown,
    topOffendingIPs,
    topTargetedEmails,
    recentBreaches,
  ] = await Promise.all([
    RateLimitLog.countDocuments({ createdAt: { $gte: dayAgo } }),
    RateLimitLog.countDocuments({ createdAt: { $gte: weekAgo } }),
    RateLimitLog.countDocuments(),
    RateLimitLog.aggregate([
      {
        $group: {
          _id: "$limiter",
          count: { $sum: 1 },
          lastBlocked: { $max: "$blockedAt" },
        },
      },
      { $sort: { count: -1 } },
    ]),
    RateLimitLog.aggregate([
      {
        $group: {
          _id: "$ip",
          count: { $sum: 1 },
          lastBlocked: { $max: "$blockedAt" },
          targetedEmails: { $addToSet: "$email" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    RateLimitLog.aggregate([
      { $match: { email: { $ne: null } } },
      {
        $group: {
          _id: "$email",
          count: { $sum: 1 },
          lastBlocked: { $max: "$blockedAt" },
          ips: { $addToSet: "$ip" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    RateLimitLog.find().sort({ createdAt: -1 }).limit(30),
  ]);

  res.json({
    metrics: {
      totalBlocks24h,
      totalBlocks7d,
      totalBlocksAllTime,
    },
    limiterBreakdown,
    topOffendingIPs,
    topTargetedEmails,
    recentBreaches,
  });
});

// @desc    Get system health and operational failure logs
// @route   GET /api/admin/analytics/system-health
// @access  Private/Admin
export const getSystemHealthAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    errors24h,
    errors7d,
    totalErrorsAllTime,
    componentBreakdown,
    recentErrors,
    totalWeeklyReportsSent,
  ] = await Promise.all([
    SystemHealthLog.countDocuments({ createdAt: { $gte: dayAgo } }),
    SystemHealthLog.countDocuments({ createdAt: { $gte: weekAgo } }),
    SystemHealthLog.countDocuments(),
    SystemHealthLog.aggregate([
      {
        $group: {
          _id: "$component",
          count: { $sum: 1 },
          lastFailure: { $max: "$createdAt" },
        },
      },
      { $sort: { count: -1 } },
    ]),
    SystemHealthLog.find().sort({ createdAt: -1 }).limit(30),
    WeeklyReport.countDocuments(),
  ]);

  let systemStatus = "healthy";
  if (errors24h > 10) {
    systemStatus = "critical";
  } else if (errors24h > 0) {
    systemStatus = "degraded";
  }

  res.json({
    systemStatus,
    metrics: {
      errors24h,
      errors7d,
      totalErrorsAllTime,
      totalWeeklyReportsSent,
    },
    componentBreakdown,
    recentErrors,
  });
});
