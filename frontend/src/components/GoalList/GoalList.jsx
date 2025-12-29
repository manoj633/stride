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
    if (goals.length === 0) {
      dispatch(fetchGoals());
    }
    dispatch(fetchTags());
  }, [dispatch, goals.length]);

  useEffect(() => {
    if (userInfo) {
      dispatch(clearError());
      dispatch(fetchGoals());
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    if (error === "Request failed with status code 401") {
      navigate("/login");
    }
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
    const handleNavigateToAdd = () => {
      navigate("/goals/add");
    };

    return (
      <div className="goal-list">
        <div
          className="goal-list__empty goal-list__empty--clickable"
          onClick={handleNavigateToAdd}
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
        {/* Compact Header Section */}
        <div className="enhanced-goals__sidebar">
          <div className="enhanced-goals__header">
            <div>
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

        {/* Main Content */}
        <div className="enhanced-goals__main">
          <div className="enhanced-goals__content">{renderContent()}</div>

          <div className="enhanced-goals__chart-container">
            <h3
              style={{
                margin: "0 0 1rem 0",
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              📈 Goal Distribution
            </h3>

            <div className="enhanced-goals__chart-wrapper">
              <DonutChart data={chartData} />
            </div>

            {/* Quick Insights */}
            <div className="enhanced-goals__insights-wrapper">
              <h4
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  marginBottom: "1rem",
                  marginTop: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>💡</span> Quick Insights
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    padding: "0.875rem",
                    background: "rgba(59, 130, 246, 0.05)",
                    borderRadius: "10px",
                    border: "1px solid rgba(59, 130, 246, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(59, 130, 246, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#64748b",
                      marginBottom: "0.25rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    📚 Total Goals
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#1a1a1a",
                    }}
                  >
                    {goals.length}
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.875rem",
                    background: "rgba(139, 92, 246, 0.05)",
                    borderRadius: "10px",
                    border: "1px solid rgba(139, 92, 246, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(139, 92, 246, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#64748b",
                      marginBottom: "0.25rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    🚀 Active
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#8b5cf6",
                    }}
                  >
                    {
                      goals.filter(
                        (g) =>
                          g.completionPercentage > 0 &&
                          g.completionPercentage < 100
                      ).length
                    }
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.875rem",
                    background: "rgba(22, 163, 74, 0.05)",
                    borderRadius: "10px",
                    border: "1px solid rgba(22, 163, 74, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(22, 163, 74, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#64748b",
                      marginBottom: "0.25rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    ✨ Completed
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#16a34a",
                    }}
                  >
                    {goals.filter((g) => g.completionPercentage === 100).length}
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.875rem",
                    background: "rgba(148, 163, 184, 0.05)",
                    borderRadius: "10px",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(148, 163, 184, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#64748b",
                      marginBottom: "0.25rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    💤 Not Started
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  >
                    {goals.filter((g) => g.completionPercentage === 0).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalList;
