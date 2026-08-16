import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchGoals } from "../../store/features/goals/goalSlice";
import { fetchTasks } from "../../store/features/tasks/taskSlice";
import { fetchSubtasks } from "../../store/features/subtasks/subtaskSlice";
import DonutChart from "../GoalList/DonutChart";
import OnboardingTour from "./OnboardingTour";
import {
  FiTarget,
  FiCheckSquare,
  FiList,
  FiActivity,
  FiClock,
  FiArrowRight,
  FiCalendar,
  FiTrendingUp,
  FiPlus,
  FiTag,
  FiCompass,
  FiAward,
  FiChevronRight,
} from "react-icons/fi";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { userInfo } = useAppSelector((state) => state.user);
  const goals = useAppSelector((state) => state.goals.items);
  const tasks = useAppSelector((state) => state.tasks.items);
  const subtasks = useAppSelector((state) => state.subtasks.items);
  const loadingGoals = useAppSelector((state) => state.goals.loading);

  const [showTour, setShowTour] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [sidebarTab, setSidebarTab] = useState("activity");

  const isNewUser = useMemo(() => {
    return goals.length === 0 && tasks.length === 0 && subtasks.length === 0;
  }, [goals, tasks, subtasks]);

  const greeting = useMemo(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good morning";
    if (hrs < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const recentMilestones = useMemo(() => {
    const completedTasks = tasks
      .filter((t) => t.completed && t.updatedAt)
      .map((t) => ({
        id: t._id,
        type: "task",
        name: t.name,
        date: new Date(t.updatedAt),
        label: "Task Completed",
      }));
    const completedGoals = goals
      .filter((g) => g.completed && g.updatedAt)
      .map((g) => ({
        id: g._id,
        type: "goal",
        name: g.title,
        date: new Date(g.updatedAt),
        label: "Goal Achieved",
      }));
    const completedSub = subtasks
      .filter((s) => s.completed && s.updatedAt)
      .map((s) => ({
        id: s._id,
        type: "subtask",
        name: s.name,
        date: new Date(s.updatedAt),
        label: "Subtask Finished",
      }));

    return [...completedTasks, ...completedGoals, ...completedSub]
      .sort((a, b) => b.date - a.date)
      .slice(0, 4);
  }, [tasks, goals, subtasks]);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  useEffect(() => {
    const tourDismissed = localStorage.getItem("onboardingDismissed");
    if (isNewUser && tourDismissed !== "true") {
      setShowTour(true);
    }
  }, [isNewUser]);

  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTasks());
    dispatch(fetchSubtasks());
  }, [dispatch]);

  // Calculations for Today's Focus
  const today = new Date().toISOString().split("T")[0];

  const tasksToday = useMemo(() => {
    return tasks
      .filter((task) => {
        const start = new Date(task.startDate).toISOString().split("T")[0];
        const end = new Date(task.endDate).toISOString().split("T")[0];
        return today >= start && today <= end && !task.completed;
      })
      .slice(0, 5);
  }, [tasks, today]);

  const subtasksToday = useMemo(() => {
    return subtasks
      .filter((st) => {
        const due = new Date(st.dueDate).toISOString().split("T")[0];
        return due === today && !st.completed;
      })
      .slice(0, 5);
  }, [subtasks, today]);

  //current year calculation
  const now = new Date();
  const currentYear = now.getFullYear();

  // Start of year: Jan 1, 00:00:00.000
  const startOfYear = new Date(currentYear, 0, 1).toISOString();

  // End of year: Dec 31, 23:59:59.999
  const endOfYear = new Date(
    currentYear,
    11,
    31,
    23,
    59,
    59,
    999,
  ).toISOString();

  // Summary Stats
  const activeGoals = goals.filter(
    (g) =>
      !g.completed &&
      g.duration.startDate >= startOfYear &&
      g.duration.endDate <= endOfYear,
  ).length;

  const pendingTasks = tasks.filter(
    (t) => !t.completed && t.startDate >= startOfYear && t.endDate <= endOfYear,
  ).length;

  const completedSubtasks = subtasks.filter(
    (s) => s.completed && s.dueDate >= startOfYear && s.dueDate <= endOfYear,
  ).length;

  const totalAnnualSubtasks = subtasks.filter(
    (s) => s.dueDate >= startOfYear && s.dueDate <= endOfYear,
  ).length;

  const totalSubtasks = subtasks.length;
  const completionRate =
    totalAnnualSubtasks > 0
      ? Math.round((completedSubtasks / totalAnnualSubtasks) * 100)
      : 0;

  // Chart Data
  const chartData = [
    { category: "Completed", value: completedSubtasks },
    { category: "Pending", value: totalAnnualSubtasks - completedSubtasks },
  ];

  const getPriorityClass = (priority) => {
    return `priority-${priority?.toLowerCase() || "medium"}`;
  };

  // filter top 4 goals of the year

  const goalsThisYear = goals.filter((g) => {
    const startDate = new Date(g.duration.startDate);
    const endDate = new Date(g.duration.endDate);

    return (
      !g.completed &&
      !g.archived &&
      startDate >= startOfYear &&
      endDate <= endOfYear
    );
  });

  const priorities = ["High", "Medium", "Low"];

  const highPriorityGoalsThisYear =
    priorities
      .map((p) => goalsThisYear.filter((g) => g.priority === p))
      .find((group) => group.length > 0)
      ?.sort((a, b) => a.completionPercentage - b.completionPercentage)
      .slice(0, 4) || [];

  console.log(highPriorityGoalsThisYear);

  return (
    <div className="enhanced-dashboard compact-view">
      <div className="dashboard-shell">
        <div className="dashboard-main">
          {/* Top Bar: Greeting + Inline Metrics + Action Buttons */}
          <header className="dashboard-topbar">
            <div className="topbar-left">
              <div className="dashboard-greeting-row">
                <h1>
                  {greeting}, {userInfo?.name?.split(" ")[0]} <span>👋</span>
                </h1>
                {userInfo?.level !== undefined && (
                  <div className="dashboard-level-badge" title={`${userInfo?.xp || 0} Total XP`}>
                    <span className="lvl-num">Lvl {userInfo.level}</span>
                    <div className="lvl-xp-bar">
                      <div 
                        className="lvl-xp-fill" 
                        style={{ width: `${(userInfo.xp || 0) % 100}%` }}
                      ></div>
                    </div>
                    <span className="lvl-xp-text">{(userInfo.xp || 0) % 100}/100 XP</span>
                  </div>
                )}
              </div>
              <span className="topbar-sub">Workspace Overview</span>
            </div>

            <div className="topbar-metrics">
              <div className="metric-pill">
                <span className="metric-icon goal"><FiTarget /></span>
                <div className="metric-data">
                  <span className="metric-count">{activeGoals}</span>
                  <span className="metric-label">Active Goals</span>
                </div>
              </div>
              <div className="metric-pill">
                <span className="metric-icon task"><FiCheckSquare /></span>
                <div className="metric-data">
                  <span className="metric-count">{pendingTasks}</span>
                  <span className="metric-label">Pending Tasks</span>
                </div>
              </div>
              <div className="metric-pill">
                <span className="metric-icon efficiency"><FiActivity /></span>
                <div className="metric-data">
                  <span className="metric-count">{completionRate}%</span>
                  <span className="metric-label">Efficiency</span>
                </div>
              </div>
            </div>

            <div className="topbar-actions">
              <button
                className="topbar-btn secondary"
                onClick={() => navigate("/calendar")}
              >
                <FiCalendar /> Calendar
              </button>
              <button
                className="topbar-btn primary"
                onClick={() => navigate("/tasks/add")}
              >
                <FiPlus /> New Task
              </button>
            </div>
          </header>

          {isNewUser && (
            <div className="onboarding-checklist-card compact">
              <div className="onboarding-checklist-card__header">
                <h2>🚀 Get Started with Stride</h2>
                <button className="tour-btn" onClick={() => setShowTour(true)}>
                  <FiCompass /> Take Tour
                </button>
              </div>
              <div className="onboarding-steps">
                <div className={`onboarding-step ${goals.length > 0 ? "completed" : ""}`} onClick={() => navigate("/goals/add")}>
                  <div className="step-checkbox">{goals.length > 0 ? "✓" : "1"}</div>
                  <div className="step-content">
                    <h3>Create a Goal</h3>
                  </div>
                </div>
                <div className={`onboarding-step ${tasks.length > 0 ? "completed" : ""}`} onClick={() => navigate("/tasks/add")}>
                  <div className="step-checkbox">{tasks.length > 0 ? "✓" : "2"}</div>
                  <div className="step-content">
                    <h3>Add a Task</h3>
                  </div>
                </div>
                <div className={`onboarding-step ${subtasks.length > 0 ? "completed" : ""}`} onClick={() => navigate("/subtasks/add")}>
                  <div className="step-checkbox">{subtasks.length > 0 ? "✓" : "3"}</div>
                  <div className="step-content">
                    <h3>Create a Subtask</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main 3-Panel Unified Grid */}
          <div className="compact-dashboard-grid">
            {/* Panel 1: Today's Focus */}
            <section className="dashboard-panel focus-panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <h2>Today's Focus</h2>
                  <span className="panel-badge">{activeTab === "tasks" ? tasksToday.length : subtasksToday.length} due</span>
                </div>
                
                <div className="panel-tabs">
                  <button 
                    className={`tab-toggle ${activeTab === "tasks" ? "active" : ""}`}
                    onClick={() => setActiveTab("tasks")}
                  >
                    Tasks ({tasksToday.length})
                  </button>
                  <button 
                    className={`tab-toggle ${activeTab === "subtasks" ? "active" : ""}`}
                    onClick={() => setActiveTab("subtasks")}
                  >
                    Subtasks ({subtasksToday.length})
                  </button>
                </div>
              </div>

              <div className="panel-scroll-content">
                {activeTab === "tasks" ? (
                  tasksToday.length === 0 ? (
                    <div className="empty-state">
                      <FiCheckSquare size={28} />
                      <p>All tasks clear for today!</p>
                      <button className="panel-add-btn" onClick={() => navigate("/tasks/add")}>
                        <FiPlus /> Add Task
                      </button>
                    </div>
                  ) : (
                    <div className="compact-items-list">
                      {tasksToday.map((task) => (
                        <div
                          key={task._id}
                          className="compact-item-row"
                          onClick={() => navigate(`/tasks/${task._id}`)}
                        >
                          <span className={`priority-indicator-dot ${task.priority?.toLowerCase() || "medium"}`} />
                          <div className="compact-item-info">
                            <div className="compact-item-title">{task.name}</div>
                            <div className="compact-item-meta">
                              <span className={`priority-tag ${task.priority?.toLowerCase() || "medium"}`}>
                                {task.priority || "Medium"}
                              </span>
                              <span><FiCalendar /> {new Date(task.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <FiChevronRight className="row-chevron" />
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  subtasksToday.length === 0 ? (
                    <div className="empty-state">
                      <FiCheckSquare size={28} />
                      <p>No subtasks due today.</p>
                      <button className="panel-add-btn" onClick={() => navigate("/subtasks/add")}>
                        <FiPlus /> Add Subtask
                      </button>
                    </div>
                  ) : (
                    <div className="compact-items-list">
                      {subtasksToday.map((st) => (
                        <div
                          key={st._id}
                          className="compact-item-row"
                          onClick={() => navigate(`/subtasks/${st._id}`)}
                        >
                          <span className={`priority-indicator-dot ${st.priority?.toLowerCase() || "medium"}`} />
                          <div className="compact-item-info">
                            <div className="compact-item-title">{st.name}</div>
                            <div className="compact-item-meta">
                              <span className={`priority-tag ${st.priority?.toLowerCase() || "medium"}`}>
                                {st.priority || "Medium"}
                              </span>
                              <span className="due-tag"><FiClock /> Due Today</span>
                            </div>
                          </div>
                          <FiChevronRight className="row-chevron" />
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Panel 2: Goal Progression */}
            <section className="dashboard-panel goals-panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <h2>Goal Progression</h2>
                  <span className="panel-badge">{goals.length} total</span>
                </div>
                <button className="panel-link-btn" onClick={() => navigate("/goals")}>
                  Manage <FiArrowRight />
                </button>
              </div>

              <div className="panel-scroll-content">
                {goals.slice(0, 4).length === 0 ? (
                  <div className="empty-state">
                    <FiTarget size={28} />
                    <p>No active goals for this year.</p>
                    <button className="panel-add-btn" onClick={() => navigate("/goals/add")}>
                      <FiPlus /> New Goal
                    </button>
                  </div>
                ) : (
                  <div className="compact-goals-list">
                    {goals.slice(0, 4).map((goal) => (
                      <div 
                        key={goal._id} 
                        className="compact-goal-card"
                        onClick={() => navigate(`/goals/${goal._id}`)}
                      >
                        <div className="compact-goal-header">
                          <div className="compact-goal-title">{goal.title}</div>
                          <span className="goal-pct">{goal.completionPercentage}%</span>
                        </div>
                        <div className="compact-progress-track">
                          <div
                            className="compact-progress-fill"
                            style={{ width: `${goal.completionPercentage}%` }}
                          />
                        </div>
                        <div className="compact-goal-footer">
                          <span className={`priority-tag ${goal.priority?.toLowerCase() || "medium"}`}>
                            {goal.priority || "Medium"}
                          </span>
                          <span>Target: {new Date(goal.duration.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Panel 3: Insights & Quick Tools (Tabbed Chart vs Achievements) */}
            <section className="dashboard-panel insights-panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <h2>Insights & Activity</h2>
                </div>
                <div className="panel-tabs">
                  <button 
                    className={`tab-toggle ${sidebarTab === "activity" ? "active" : ""}`}
                    onClick={() => setSidebarTab("activity")}
                  >
                    Chart
                  </button>
                  <button 
                    className={`tab-toggle ${sidebarTab === "achievements" ? "active" : ""}`}
                    onClick={() => setSidebarTab("achievements")}
                  >
                    Milestones
                  </button>
                </div>
              </div>

              <div className="panel-scroll-content">
                {sidebarTab === "activity" ? (
                  <div className="chart-wrapper">
                    <DonutChart data={chartData} height="190px" />
                  </div>
                ) : (
                  <div className="compact-milestones-list">
                    {recentMilestones.length === 0 ? (
                      <div className="empty-state">
                        <FiAward size={28} />
                        <p>Complete tasks or goals to see achievements here.</p>
                      </div>
                    ) : (
                      recentMilestones.map((milestone) => (
                        <div key={milestone.id} className="compact-milestone-row">
                          <div className={`milestone-badge-icon ${milestone.type}`}>
                            {milestone.type === "goal" ? <FiTarget /> : <FiCheckSquare />}
                          </div>
                          <div className="compact-milestone-content">
                            <div className="milestone-name">{milestone.name}</div>
                            <span className="milestone-sub">{milestone.label} • {formatTimeAgo(milestone.date)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="panel-quick-toolbar">
                <button onClick={() => navigate("/pomodoro")} className="quick-tool-btn">
                  <FiClock /> Pomodoro
                </button>
                <button onClick={() => navigate("/tags/manage")} className="quick-tool-btn">
                  <FiTag /> Tags
                </button>
                <button onClick={() => navigate("/calendar")} className="quick-tool-btn">
                  <FiCalendar /> Calendar
                </button>
              </div>
            </section>
          </div>

          <OnboardingTour isOpen={showTour} onClose={() => setShowTour(false)} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
