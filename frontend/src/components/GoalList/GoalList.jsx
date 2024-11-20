import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import * as am5 from "@amcharts/amcharts5";

import "./GoalList.css";
import DonutChart from "../GoalList/DonutChart";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchGoals,
  deleteGoal,
  updateGoalStatus,
  archiveGoal,
  selectGoalStats,
} from "../../store/features/goals/goalSlice";
import { fetchTags } from "../../store/features/tags/tagSlice";

// View Components
const ListView = ({
  goals,
  handleGoalSelect,
  tags,
  selectedGoals,
  navigate,
}) => (
  <div className="enhanced-goals__list">
    {goals.map(
      (goal) =>
        !goal.archived && (
          <div
            className={`enhanced-goals__item ${
              selectedGoals.includes(goal._id) ? "selected" : ""
            }`}
            key={goal._id}
          >
            <input
              type="checkbox"
              checked={selectedGoals.includes(goal._id)}
              onChange={() => handleGoalSelect(goal._id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div
              className="enhanced-goals__item-content"
              onClick={() => navigate(`/goals/${goal._id}`)}
            >
              <span className="enhanced-goals__item-title">{goal.title}</span>
              <div className="enhanced-goals__item-details">
                <span
                  className={`priority-badge ${goal.priority.toLowerCase()}`}
                >
                  {goal.priority}
                </span>
                <span className="category-badge">{goal.category}</span>
                {goal.tags &&
                  goal.tags.map((tag) => (
                    <span key={tag} className="tag-badge">
                      {tags?.find((t) => t._id == tag).name}
                    </span>
                  ))}
              </div>
              <div className="enhanced-goals__item-progress">
                <div
                  className="enhanced-goals__item-progress-bar"
                  style={{ width: `${goal.completionPercentage}%` }}
                ></div>
                <span className="progress-text">
                  {goal.completionPercentage}%
                </span>
              </div>
            </div>
          </div>
        )
    )}
  </div>
);

const KanbanBoard = ({ goals }) => (
  <div className="enhanced-goals__kanban">
    <div className="kanban-column">
      <h3>Not Started</h3>
      {goals
        .filter((g) => g.completionPercentage === 0)
        .map((goal) => (
          <div key={goal._id} className="kanban-card">
            <h4>{goal.title}</h4>
            <span className={`priority-badge ${goal.priority.toLowerCase()}`}>
              {goal.priority}
            </span>
          </div>
        ))}
    </div>
    <div className="kanban-column">
      <h3>In Progress</h3>
      {goals
        .filter(
          (g) => g.completionPercentage > 0 && g.completionPercentage < 100
        )
        .map((goal) => (
          <div key={goal._id} className="kanban-card">
            <h4>{goal.title}</h4>
            <span className={`priority-badge ${goal.priority.toLowerCase()}`}>
              {goal.priority}
            </span>
          </div>
        ))}
    </div>
    <div className="kanban-column">
      <h3>Completed</h3>
      {goals
        .filter((g) => g.completionPercentage === 100)
        .map((goal) => (
          <div key={goal._id} className="kanban-card">
            <h4>{goal.title}</h4>
            <span className={`priority-badge ${goal.priority.toLowerCase()}`}>
              {goal.priority}
            </span>
          </div>
        ))}
    </div>
  </div>
);

const CalendarView = ({ goals }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const goalsForSelectedDate = goals.filter((goal) => {
    if (!goal.duration?.startDate || !goal.duration?.endDate) {
      return false;
    }
    const startDate = new Date(goal.duration.startDate);
    const endDate = new Date(goal.duration.endDate);
    return selectedDate >= startDate && selectedDate <= endDate;
  });

  return (
    <div className="calendar-view">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={({ date }) => {
          const hasGoals = goals.some((goal) => {
            const startDate = new Date(goal.duration?.startDate);
            const endDate = new Date(goal.duration?.endDate);
            return date >= startDate && date <= endDate;
          });
          return hasGoals ? (
            <div className="calendar-goals-indicator">•</div>
          ) : null;
        }}
      />
      <div className="calendar-goals-list">
        <h3>Goals for {selectedDate.toDateString()}</h3>
        {goalsForSelectedDate.map((goal) => (
          <div key={goal._id} className="calendar-goal-item">
            <div>{goal.title}</div>
            <div>{goal.completionPercentage}%</div>
            <div className="goal-duration">
              {new Date(goal.duration?.startDate).toLocaleDateString()} -
              {new Date(goal.duration?.endDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TimelineView = ({ goals }) => (
  <div className="enhanced-goals__timeline">
    {goals
      .sort(
        (a, b) =>
          new Date(a.duration.startDate) - new Date(b.duration.startDate)
      )
      .map((goal) => (
        <div key={goal._id} className="timeline-item">
          <div className="timeline-date">
            {new Date(goal.duration.startDate).toLocaleDateString()} -
            {new Date(goal.duration.endDate).toLocaleDateString()}
          </div>
          <div className="timeline-content">
            <h4>{goal.title}</h4>
            <div className="timeline-progress">
              <div
                className="progress-bar"
                style={{ width: `${goal.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
  </div>
);

const GoalList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state) => state.goals.items);
  const loading = useAppSelector((state) => state.goals.loading);
  const error = useAppSelector((state) => state.goals.error);
  const tags = useAppSelector((state) => state.tags.items);

  // Add useEffect to fetch goals when component mounts
  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTags());
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [viewType, setViewType] = useState("list");
  const [selectedGoals, setSelectedGoals] = useState([]);

  const handleBulkDelete = () => {
    if (selectedGoals.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedGoals.length} selected goal(s)?`
    );

    if (confirmDelete) {
      // Dispatch delete actions for each selected goal
      selectedGoals.forEach((goalId) => {
        dispatch(deleteGoal(goalId));
      });
      setSelectedGoals([]);
    }
  };

  // components/SomeComponent.jsx
  const handleBulkStatusUpdate = async () => {
    if (selectedGoals.length === 0) return;

    const confirmUpdate = window.confirm(
      `Do you want to mark ${selectedGoals.length} selected goal(s) as completed?`
    );

    if (confirmUpdate) {
      try {
        // Using Promise.all to handle multiple async updates
        await Promise.all(
          selectedGoals.map((goalId) =>
            dispatch(
              updateGoalStatus({
                id: goalId,
                status: {
                  completed: true,
                  completionPercentage: 100,
                },
              })
            ).unwrap()
          )
        );

        // Clear selection after successful updates
        setSelectedGoals([]);

        // Optionally refresh the goals list
        dispatch(fetchGoals());
      } catch (error) {
        // Handle any errors that occurred during the updates
        console.error("Failed to update goals:", error);
      }
    }
  };

  const handleBulkArchive = () => {
    if (selectedGoals.length === 0) return;

    const confirmArchive = window.confirm(
      `Are you sure you want to archive ${selectedGoals.length} selected goal(s)?`
    );

    if (confirmArchive) {
      selectedGoals.forEach((goalId) => {
        dispatch(archiveGoal(goalId));
      });
      setSelectedGoals([]);
    }
  };

  const stats = useAppSelector(selectGoalStats);
  const chartData = useMemo(() => {
    const completed = goals.filter(
      (g) => g.completionPercentage === 100
    ).length;
    const inProgress = goals.filter(
      (g) => g.completionPercentage > 0 && g.completionPercentage < 100
    ).length;
    const notStarted = goals.filter((g) => g.completionPercentage === 0).length;
    const total = goals.length;

    return [
      {
        category: "Completed",
        value: total ? Math.round((completed / total) * 100) : 0,
        settings: { fill: am5.color("#1a73e8") },
      },
      {
        category: "In Progress",
        value: total ? Math.round((inProgress / total) * 100) : 0,
        settings: { fill: am5.color("#4285f4") },
      },
      {
        category: "Not Started",
        value: total ? Math.round((notStarted / total) * 100) : 0,
        settings: { fill: am5.color("#8ab4f8") },
      },
    ];
  }, [goals]);

  const filteredAndSortedGoals = useMemo(() => {
    return goals
      .filter((goal) => {
        const matchesSearch = goal.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        if (filterStatus === "all") return matchesSearch;
        if (filterStatus === "completed")
          return goal.completionPercentage === 100 && matchesSearch;
        if (filterStatus === "in-progress")
          return (
            goal.completionPercentage > 0 &&
            goal.completionPercentage < 100 &&
            matchesSearch
          );
        if (filterStatus === "overdue") {
          const isOverdue =
            new Date() > new Date(goal.duration.endDate) &&
            goal.completionPercentage < 100;
          return isOverdue && matchesSearch;
        }
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "dueDate":
            return new Date(a.duration.endDate) - new Date(b.duration.endDate);
          case "priority":
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case "completion":
            return b.completionPercentage - a.completionPercentage;
          case "alphabetical":
            return a.title.localeCompare(b.title);
          case "created":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "lastModified":
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          default:
            return 0;
        }
      });
  }, [goals, searchTerm, filterStatus, sortBy]);

  const handleGoalSelect = (goalId) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const exportGoals = () => {
    const dataStr = JSON.stringify(goals);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "goals.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const renderContent = () => {
    switch (viewType) {
      case "kanban":
        return <KanbanBoard goals={filteredAndSortedGoals} />;
      case "calendar":
        return <CalendarView goals={filteredAndSortedGoals} />;
      case "timeline":
        return <TimelineView goals={filteredAndSortedGoals} />;
      default:
        return (
          <ListView
            goals={filteredAndSortedGoals}
            handleGoalSelect={handleGoalSelect}
            tags={tags}
            selectedGoals={selectedGoals}
            navigate={navigate}
          />
        );
    }
  };

  if (loading) return <div>Loading goals...</div>;
  if (error) return <div>Error: {error}</div>;
  if (goals.length === 0) return <div>No goals present. Add a new goal</div>;

  return (
    <div className="enhanced-goals-container">
      <div className="enhanced-goals">
        <div className="enhanced-goals__sidebar">
          <div className="enhanced-goals__header">
            <h2>My Goals</h2>

            <div className="goals__stats">
              <div className="stat-item">
                <h3>Completion Rate</h3>
                <p>{stats.completionRate.toFixed(1)}%</p>
              </div>
              <div className="stat-item">
                <h3>Overdue Goals</h3>
                <p>{stats.overdueGoals}</p>
              </div>
              <div className="stat-item">
                <h3>Goals This Month</h3>
                <p>{stats.monthlyGoals}</p>
              </div>
            </div>

            <div className="enhanced-goals__controls">
              <input
                type="text"
                placeholder="Search goals..."
                className="enhanced-goals__search-input"
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="enhanced-goals__filters">
                <select
                  className="enhanced-goals__filter-select"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Goals</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>

                <select
                  className="enhanced-goals__sort-select"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="completion">Completion %</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="created">Creation Date</option>
                  <option value="lastModified">Last Modified</option>
                </select>

                <select
                  className="enhanced-goals__view-select"
                  onChange={(e) => setViewType(e.target.value)}
                >
                  <option value="list">List View</option>
                  <option value="kanban">Kanban Board</option>
                  <option value="calendar">Calendar View</option>
                  <option value="timeline">Timeline View</option>
                </select>
              </div>

              {selectedGoals.length > 0 && (
                <div className="enhanced-goals__bulk-actions">
                  <button onClick={handleBulkDelete}>
                    Delete Selected ({selectedGoals.length})
                  </button>
                  <button
                    onClick={handleBulkStatusUpdate}
                    className="enhanced-goals__bulk-action-btn"
                  >
                    Update Status ({selectedGoals.length})
                  </button>
                  <button
                    onClick={handleBulkArchive}
                    className="enhanced-goals__bulk-action-btn"
                  >
                    Archive Selected ({selectedGoals.length})
                  </button>
                </div>
              )}

              <button
                className="enhanced-goals__export-btn"
                onClick={exportGoals}
              >
                Export Goals
              </button>
            </div>
          </div>
        </div>
        <div className="enhanced-goals__main">
          <div className="enhanced-goals__content">{renderContent()}</div>

          <div className="enhanced-goals__chart-container">
            <h3>Goal Distribution</h3>
            <DonutChart data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalList;
