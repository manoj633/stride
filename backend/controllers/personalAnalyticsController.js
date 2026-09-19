import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import Goal from "../models/goalModel.js";
import Task from "../models/taskModel.js";
import Subtask from "../models/subtaskModel.js";
import PomodoroSession from "../models/pomodoroSessionModel.js";
import { getHydratedAchievements } from "../utils/achievementsRegistry.js";

// @desc    Get personal Year in Review analytics for the authenticated user
// @route   GET /api/users/year-in-review
// @access  Private
export const getPersonalYearInReview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const currentYear = new Date().getFullYear();
  const selectedYear = parseInt(req.query.year, 10) || currentYear;

  const startOfYear = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0, 0));
  const endOfYear = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));

  // 1. Fetch user doc for gamification baseline
  const user = await User.findById(userId).select(
    "name email createdAt xp level streak totalPomodorosCompleted totalTasksCompleted totalGoalsCompleted achievements"
  );
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // 2. Derive available years dynamically from user signup date and entities
  const [earliestGoal, earliestTask] = await Promise.all([
    Goal.findOne({ createdBy: userId }).sort({ createdAt: 1 }).select("createdAt duration"),
    Task.findOne({ createdBy: userId }).sort({ createdAt: 1 }).select("createdAt startDate"),
  ]);

  const candidateDates = [user.createdAt];
  if (earliestGoal?.createdAt) candidateDates.push(earliestGoal.createdAt);
  if (earliestGoal?.duration?.startDate) candidateDates.push(earliestGoal.duration.startDate);
  if (earliestTask?.createdAt) candidateDates.push(earliestTask.createdAt);
  if (earliestTask?.startDate) candidateDates.push(earliestTask.startDate);

  const minYear = Math.min(...candidateDates.map((d) => new Date(d).getFullYear()), currentYear);
  const availableYears = [];
  for (let y = currentYear; y >= minYear; y--) {
    availableYears.push(y);
  }

  // 3. Goals Aggregation (using overlap logic)
  const goalsFilter = {
    createdBy: userId,
    $or: [
      {
        "duration.startDate": { $lte: endOfYear },
        "duration.endDate": { $gte: startOfYear },
      },
      {
        $and: [
          {
            $or: [
              { duration: { $exists: false } },
              { "duration.startDate": { $exists: false } },
            ],
          },
          { createdAt: { $gte: startOfYear, $lte: endOfYear } },
        ],
      },
    ],
  };

  const goalsInYear = await Goal.find(goalsFilter).lean();

  const totalGoals = goalsInYear.length;
  const completedGoals = goalsInYear.filter(
    (g) => g.completed === true || g.completionPercentage === 100
  );
  const completedGoalsCount = completedGoals.length;
  const goalCompletionRate =
    totalGoals > 0 ? Math.round((completedGoalsCount / totalGoals) * 100) : 0;

  // Category distribution
  const categoryMap = {};
  goalsInYear.forEach((g) => {
    const cat = g.category || "Other";
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, total: 0, completed: 0 };
    }
    categoryMap[cat].total += 1;
    if (g.completed || g.completionPercentage === 100) {
      categoryMap[cat].completed += 1;
    }
  });

  const categories = Object.values(categoryMap)
    .map((c) => ({
      ...c,
      rate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Priority distribution
  const priorityMap = { High: 0, Medium: 0, Low: 0 };
  goalsInYear.forEach((g) => {
    const p = g.priority || "Medium";
    priorityMap[p] = (priorityMap[p] || 0) + 1;
  });

  // Top standout goals (completed goals with highest completion & priority)
  const priorityWeight = { High: 3, Medium: 2, Low: 1 };
  const standoutGoals = [...completedGoals]
    .sort((a, b) => {
      const pDiff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
      if (pDiff !== 0) return pDiff;
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    })
    .slice(0, 4)
    .map((g) => ({
      _id: g._id,
      title: g.title,
      category: g.category || "Other",
      priority: g.priority || "Medium",
      completionPercentage: g.completionPercentage || 100,
    }));

  // 4. Tasks & Subtasks Aggregation
  const tasksInYear = await Task.find({
    createdBy: userId,
    $or: [
      { startDate: { $lte: endOfYear }, endDate: { $gte: startOfYear } },
      { createdAt: { $gte: startOfYear, $lte: endOfYear } },
      { updatedAt: { $gte: startOfYear, $lte: endOfYear }, completed: true },
    ],
  }).lean();

  const totalTasks = tasksInYear.length;
  const completedTasks = tasksInYear.filter((t) => t.completed === true);
  const completedTasksCount = completedTasks.length;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // 12-Month activity trend
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const monthlyTrend = monthNames.map((name, index) => ({
    month: name,
    monthIndex: index,
    completions: 0,
    created: 0,
  }));

  tasksInYear.forEach((task) => {
    // Created trend
    if (task.createdAt) {
      const cDate = new Date(task.createdAt);
      if (cDate.getFullYear() === selectedYear) {
        monthlyTrend[cDate.getMonth()].created += 1;
      }
    }
    // Completed trend (using updatedAt as completion proxy)
    if (task.completed && task.updatedAt) {
      const uDate = new Date(task.updatedAt);
      if (uDate.getFullYear() === selectedYear) {
        monthlyTrend[uDate.getMonth()].completions += 1;
      }
    }
  });

  // Determine Peak Productivity Month
  let peakMonth = { month: "N/A", completions: 0 };
  monthlyTrend.forEach((m) => {
    if (m.completions > peakMonth.completions) {
      peakMonth = { month: m.month, completions: m.completions };
    }
  });

  // Subtasks completed in year
  const completedSubtasksCount = await Subtask.countDocuments({
    createdBy: userId,
    completed: true,
    updatedAt: { $gte: startOfYear, $lte: endOfYear },
  });

  // 5. Pomodoro Focus Sessions with Cutover Boundary
  const earliestSession = await PomodoroSession.findOne({ user: userId })
    .sort({ completedAt: 1 })
    .select("completedAt")
    .lean();

  let pomodoroSessionsCount = 0;
  let focusMinutes = 0;
  let pomodoroTrackingStatus = "tracked"; // 'tracked' | 'legacy_untracked' | 'not_tracked'

  if (earliestSession?.completedAt) {
    const cutoverYear = new Date(earliestSession.completedAt).getFullYear();
    if (selectedYear >= cutoverYear) {
      // In or after cutover year: query actual timestamped sessions (genuine 0 if none)
      const sessionDocs = await PomodoroSession.find({
        user: userId,
        completedAt: { $gte: startOfYear, $lte: endOfYear },
      }).select("durationMinutes");

      pomodoroSessionsCount = sessionDocs.length;
      focusMinutes = sessionDocs.reduce((sum, s) => sum + (s.durationMinutes || 25), 0);
      pomodoroTrackingStatus = "tracked";
    } else {
      // Before cutover year: honest reporting
      if (user.totalPomodorosCompleted > 0 && selectedYear === new Date(user.createdAt).getFullYear()) {
        pomodoroSessionsCount = user.totalPomodorosCompleted;
        focusMinutes = pomodoroSessionsCount * 25;
        pomodoroTrackingStatus = "legacy_untracked";
      } else {
        pomodoroSessionsCount = 0;
        focusMinutes = 0;
        pomodoroTrackingStatus = "not_tracked";
      }
    }
  } else {
    // No PomodoroSession documents exist in database yet for this user
    if (user.totalPomodorosCompleted > 0 && (selectedYear === currentYear || selectedYear === new Date(user.createdAt).getFullYear())) {
      pomodoroSessionsCount = user.totalPomodorosCompleted;
      focusMinutes = pomodoroSessionsCount * 25;
      pomodoroTrackingStatus = "legacy_untracked";
    } else {
      pomodoroSessionsCount = 0;
      focusMinutes = 0;
      pomodoroTrackingStatus = user.totalPomodorosCompleted > 0 ? "not_tracked" : "tracked";
    }
  }

  // 6. XP & Gamification
  // Formula: Goals (+100), Tasks (+30), Subtasks (+10), Pomodoro (+15)
  const estimatedActivityXp =
    completedGoalsCount * 100 +
    completedTasksCount * 30 +
    completedSubtasksCount * 10 +
    pomodoroSessionsCount * 15;

  const hydratedAchievements = getHydratedAchievements(user.achievements || []);

  // 7. Dynamic Persona Archetype
  let archetype = {
    title: "Consistent Builder",
    badge: "🌱",
    tagline: "Making steady, incremental gains across all personal priorities",
  };

  const topCategory = categories[0]?.category;

  if (pomodoroSessionsCount >= 15 || focusMinutes >= 375) {
    archetype = {
      title: "Deep Focus Specialist",
      badge: "🧘",
      tagline: "Harnessing dedicated focus sessions to conquer deep, demanding work",
    };
  } else if (topCategory === "Career" || topCategory === "Work") {
    archetype = {
      title: "Career Strategist",
      badge: "🚀",
      tagline: "Channeling energy into career advancement and strategic execution",
    };
  } else if (topCategory === "Health" || topCategory === "Fitness") {
    archetype = {
      title: "Vitality Champion",
      badge: "⚡",
      tagline: "Prioritizing physical wellness, stamina, and holistic health",
    };
  } else if (topCategory === "Education") {
    archetype = {
      title: "Curious Polymath",
      badge: "📚",
      tagline: "Driven by expanding intellect, skills acquisition, and craft mastery",
    };
  } else if (goalCompletionRate >= 70 && completedGoalsCount >= 2) {
    archetype = {
      title: "Relentless Finisher",
      badge: "👑",
      tagline: "High-octane execution turning ambitious plans into completed results",
    };
  } else if (completedTasksCount >= 20) {
    archetype = {
      title: "Execution Dynamo",
      badge: "🔥",
      tagline: "Crushing high task volumes with consistent daily momentum",
    };
  }

  res.json({
    year: selectedYear,
    currentYear,
    availableYears,
    user: {
      name: user.name,
      level: user.level || 1,
      totalXp: user.xp || 0,
      streak: user.streak || 0,
    },
    archetype,
    metrics: {
      goals: {
        total: totalGoals,
        completed: completedGoalsCount,
        rate: goalCompletionRate,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasksCount,
        rate: taskCompletionRate,
        subtasksCompleted: completedSubtasksCount,
      },
      focus: {
        sessions: pomodoroSessionsCount,
        focusMinutes,
        focusHours: Number((focusMinutes / 60).toFixed(1)),
        trackingStatus: pomodoroTrackingStatus,
      },
      xp: {
        estimatedActivityXp,
        totalXp: user.xp || 0,
        disclaimer:
          "Estimated from completed goals (+100), tasks (+30), subtasks (+10), and focus sessions (+15) logged in this calendar year. Streak bonuses and one-off rewards are omitted from the single-year activity sum.",
      },
    },
    monthlyTrend,
    peakMonth,
    categories,
    priorityBreakdown: priorityMap,
    standoutGoals,
    achievements: hydratedAchievements,
  });
});
