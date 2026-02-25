// src/components/GoalList/GoalList.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchGoals,
  clearError,
  selectGoalStats,
} from "../../store/features/goals/goalSlice";
import { fetchTags } from "../../store/features/tags/tagSlice";

import KanbanBoard from "./views/KanbanBoard";
import CalendarView from "./views/CalendarView";
import TimelineView from "./views/TimelineView";
import ListView from "./views/ListView";
import { SearchAndFilters } from "./controls/SearchAndFilters";
import { BulkActions } from "./controls/BulkActions";
import { Stats } from "./Stats";
import DonutChart from "./DonutChart";
import { useGoalListLogic } from "./hooks/useGoalListLogic";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import "./GoalList.css";

const GoalList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state) => state.goals.items);
  const loading = useAppSelector((state) => state.goals.loading);
  const error = useAppSelector((state) => state.goals.error);
  const tags = useAppSelector((state) => state.tags.items);
  const stats = useAppSelector(selectGoalStats);
  const userInfo = useAppSelector((state) => state.user.userInfo);

  useEffect(() => {
    if (goals.length === 0) dispatch(fetchGoals());
    dispatch(fetchTags());
  }, [dispatch, goals.length]);

  useEffect(() => {
    if (userInfo) {
      dispatch(clearError());
      dispatch(fetchGoals());
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    if (error === "Request failed with status code 401") navigate("/login");
  }, [error, navigate]);

  const {
    searchTerm,
    filterStatus,
    sortBy,
    viewType,
    selectedGoals,
    setSearchTerm,
    setFilterStatus,
    setSortBy,
    setViewType,
    filteredAndSortedGoals,
    handleGoalSelect,
    handleBulkDelete,
    handleBulkStatusUpdate,
    handleBulkArchive,
    exportGoals,
    chartData,
  } = useGoalListLogic(goals);

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

  if (loading) return <LoadingSpinner message="Loading goals..." />;
  if (error) return <ErrorMessage message={error} />;

  if (goals.length === 0) {
    return (
      <div className="goal-list">
        <div
          className="goal-list__empty goal-list__empty--clickable"
          onClick={() => navigate("/goals/add")}
        >
          <div className="goal-list__empty-content">
            <div className="goal-list__empty-text">
              No Goals found for today
            </div>
            <div className="goal-list__empty-action">Click to add a Goal</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-goals-container">
      <div className="enhanced-goals">
        {/* ── Top header bar ── */}
        <div className="enhanced-goals__sidebar">
          <div className="enhanced-goals__header">
            <div className="enhanced-goals__header-title">
              <h2>My Goals</h2>
            </div>

            <Stats stats={stats} />

            <SearchAndFilters
              setSearchTerm={setSearchTerm}
              setFilterStatus={setFilterStatus}
              setSortBy={setSortBy}
              setViewType={setViewType}
              sortBy={sortBy}
            />

            <div className="enhanced-goals__actions">
              {selectedGoals?.length > 0 && (
                <BulkActions
                  selectedGoals={selectedGoals}
                  onDelete={handleBulkDelete}
                  onStatusUpdate={handleBulkStatusUpdate}
                  onArchive={handleBulkArchive}
                />
              )}
              <button
                className="enhanced-goals__export-btn"
                onClick={exportGoals}
                aria-label="Export all goals"
              >
                📊 Export Goals
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="enhanced-goals__main">
          {/* Goals list / board */}
          <div className="enhanced-goals__content">{renderContent()}</div>

          {/* Chart + summary sidebar */}
          <div className="enhanced-goals__chart-container">
            <h3 className="chart-section-title">📈 Goal Distribution</h3>

            <div className="enhanced-goals__chart-wrapper">
              <DonutChart data={chartData} />
            </div>

            <div className="enhanced-goals__insights-wrapper">
              <h4 className="insights-title">💡 Quick Insights</h4>
              <div className="insights-grid">
                <InsightCard
                  label="Total Goals"
                  emoji="📚"
                  value={goals.length}
                  colorVar="blue"
                />
                <InsightCard
                  label="Active"
                  emoji="🚀"
                  value={
                    goals.filter(
                      (g) =>
                        g.completionPercentage > 0 &&
                        g.completionPercentage < 100,
                    ).length
                  }
                  colorVar="purple"
                />
                <InsightCard
                  label="Completed"
                  emoji="✨"
                  value={
                    goals.filter((g) => g.completionPercentage === 100).length
                  }
                  colorVar="green"
                />
                <InsightCard
                  label="Not Started"
                  emoji="💤"
                  value={
                    goals.filter((g) => g.completionPercentage === 0).length
                  }
                  colorVar="slate"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Small reusable insight card – keeps JSX clean */
const INSIGHT_COLORS = {
  blue: {
    bg: "rgba(59,130,246,0.05)",
    border: "rgba(59,130,246,0.1)",
    text: "#3b82f6",
  },
  purple: {
    bg: "rgba(139,92,246,0.05)",
    border: "rgba(139,92,246,0.1)",
    text: "#8b5cf6",
  },
  green: {
    bg: "rgba(22,163,74,0.05)",
    border: "rgba(22,163,74,0.1)",
    text: "#16a34a",
  },
  slate: {
    bg: "rgba(148,163,184,0.05)",
    border: "rgba(148,163,184,0.1)",
    text: "#64748b",
  },
};

const InsightCard = ({ label, emoji, value, colorVar }) => {
  const c = INSIGHT_COLORS[colorVar];
  return (
    <div
      className="insight-card"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="insight-card__label">
        {emoji} {label}
      </div>
      <div className="insight-card__value" style={{ color: c.text }}>
        {value}
      </div>
    </div>
  );
};

export default GoalList;
