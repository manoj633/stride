import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchGoals } from "../../store/features/goals/goalSlice";
import { fetchTasks } from "../../store/features/tasks/taskSlice";
import { fetchSubtasks } from "../../store/features/subtasks/subtaskSlice";
import DonutChart from "../GoalList/DonutChart";
import {
  FiTarget,
  FiCheckSquare,
  FiList,
  FiActivity,
  FiClock,
  FiArrowRight,
  FiCalendar,
  FiTrendingUp,
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
    <div className="enhanced-dashboard">
      <div className="dashboard-shell">
        {/* Main Content Area */}
        <div className="dashboard-main">
          <header className="dashboard-header">
            <div className="header-left">
              <span className="breadcrumb">Enterprise / Overview</span>
              <h1>
                Welcome back, {userInfo?.name?.split(" ")[0]} <span>👋</span>
              </h1>
              <p className="subtitle">
                Here's what's happening with your projects today.
              </p>
            </div>
            <div className="header-actions">
              <button
                className="secondary-btn"
                onClick={() => navigate("/calendar")}
              >
                <FiCalendar /> View Calendar
              </button>
              <button
                className="primary-btn"
                onClick={() => navigate("/tasks/add")}
              >
                <FiPlusCircle /> New Task
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon goal-bg">
                <FiTarget />
              </div>
              <div className="stat-info">
                <label>Active Goals</label>
                <div className="stat-value">{activeGoals}</div>
              </div>
              <div className="stat-trend positive">
                <FiTrendingUp /> 12%
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon task-bg">
                <FiCheckSquare />
              </div>
              <div className="stat-info">
                <label>Pending Tasks</label>
                <div className="stat-value">{pendingTasks}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon efficiency-bg">
                <FiActivity />
              </div>
              <div className="stat-info">
                <label>Overall Efficiency</label>
                <div className="stat-value">{completionRate}%</div>
              </div>
            </div>
          </div>

          <div className="dashboard-content-layout">
            {/* Left: Focus Today */}
            <div className="focus-section">
              <div className="section-header">
                <h2>Today's Focus</h2>
                <button className="text-btn" onClick={() => navigate("/tasks")}>
                  View all <FiArrowRight />
                </button>
              </div>

              <div className="focus-list">
                {tasksToday.length === 0 && subtasksToday.length === 0 ? (
                  <div className="empty-focus">
                    <FiCheckSquare size={40} />
                    <p>Your schedule is clear for today!</p>
                  </div>
                ) : (
                  <>
                    {tasksToday.map((task) => (
                      <div
                        key={task._id}
                        className="focus-item"
                        onClick={() => navigate(`/tasks/${task._id}`)}
                      >
                        <div
                          className={`priority-indicator ${getPriorityClass(task.priority)}`}
                        ></div>
                        <div className="focus-item-content">
                          <span className="item-type">Task</span>
                          <h3>{task.name}</h3>
                        </div>
                        <div className="focus-item-meta">
                          <span className="due-label">Active</span>
                        </div>
                      </div>
                    ))}
                    {subtasksToday.map((st) => (
                      <div
                        key={st._id}
                        className="focus-item subtask"
                        onClick={() => navigate(`/subtasks/${st._id}`)}
                      >
                        <div
                          className={`priority-indicator ${getPriorityClass(st.priority)}`}
                        ></div>
                        <div className="focus-item-content">
                          <span className="item-type">Subtask</span>
                          <h3>{st.name}</h3>
                        </div>
                        <div className="focus-item-meta">
                          <span className="due-label">Due Today</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Goal Progress Section */}
              <div className="section-header mt-8">
                <h2>Goal Progression</h2>
                <button className="text-btn" onClick={() => navigate("/goals")}>
                  Manage <FiArrowRight />
                </button>
              </div>
              <div className="goals-progress-grid">
                {goals.slice(0, 4).map((goal) => (
                  <div key={goal._id} className="goal-mini-card">
                    <div className="goal-mini-header">
                      <h3>{goal.title}</h3>
                      <span>{goal.completionPercentage}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${goal.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Insights Sidebar */}
            <aside className="dashboard-sidebar">
              <div className="sidebar-widget">
                <h3>Activity Distribution</h3>
                <div className="chart-container">
                  <DonutChart data={chartData} />
                </div>
              </div>

              <div className="sidebar-widget">
                <h3>Recent Milestones</h3>
                <div className="milestones-list">
                  <div className="milestone-item">
                    <div className="milestone-icon">
                      <FiClock />
                    </div>
                    <div className="milestone-text">
                      <p>Weekly report generated</p>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                  <div className="milestone-item">
                    <div className="milestone-icon success">
                      <FiCheckSquare />
                    </div>
                    <div className="milestone-text">
                      <p>Project Alpha completed</p>
                      <span>Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sidebar-promo">
                <FiTarget size={24} />
                <p>
                  Stay focused! You're on track to complete 85% of your goals
                  this month.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

const FiPlusCircle = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export default Dashboard;
