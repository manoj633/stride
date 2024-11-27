// src/components/GoalList/GoalList.jsx
import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchGoals,
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
import "./GoalList.css";

const GoalList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state) => state.goals.items);
  const loading = useAppSelector((state) => state.goals.loading);
  const error = useAppSelector((state) => state.goals.error);
  const tags = useAppSelector((state) => state.tags.items);
  const stats = useAppSelector(selectGoalStats);

  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTags());
  }, [dispatch]);

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

  if (loading) return <div>Loading goals...</div>;
  if (error) return <div>Error: {error}</div>;
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
        <div className="enhanced-goals__sidebar">
          <div className="enhanced-goals__header">
            <h2>My Goals</h2>
            <Stats stats={stats} />
            <SearchAndFilters
              setSearchTerm={setSearchTerm}
              setFilterStatus={setFilterStatus}
              setSortBy={setSortBy}
              setViewType={setViewType}
            />
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
            >
              Export Goals
            </button>
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
