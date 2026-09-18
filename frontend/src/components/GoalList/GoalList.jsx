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

  const {
    sortBy,
    viewType,
    selectedGoals,
    selectedYear,
    setSelectedYear,
    archiveStatus,
    setArchiveStatus,
    availableYears,
    setSearchTerm,
    setFilterStatus,
    setSortBy,
    setViewType,
    filteredAndSortedGoals,
    handleGoalSelect,
    handleBulkDelete,
    handleBulkStatusUpdate,
    handleBulkArchive,
    handleBulkUnarchive,
    exportGoals,
    chartData,
  } = useGoalListLogic(goals);

  // Fetch goals and tags when userInfo or selectedYear is updated
  useEffect(() => {
    if (userInfo) {
      dispatch(clearError());
      dispatch(
        fetchGoals(selectedYear === "all" ? {} : { year: selectedYear })
      );
      dispatch(fetchTags());
    }
  }, [userInfo, dispatch, selectedYear]);

  useEffect(() => {
    if (error === "Request failed with status code 401") navigate("/login");
  }, [error, navigate]);

  const renderContent = () => {
    switch (viewType) {
      case "kanban":
        return <KanbanBoard goals={filteredAndSortedGoals} />;
      case "calendar":
        return (
          <CalendarView
            goals={filteredAndSortedGoals}
            selectedYear={selectedYear}
          />
        );
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

  if (loading) return <LoadingSpinner message="Loading goals…" />;
  if (error) return <ErrorMessage message={error} />;

  // Derive counts once — not inline per render
  const activeGoals = goals.filter(
    (g) => g.completionPercentage > 0 && g.completionPercentage < 100,
  ).length;
  const completedGoals = goals.filter(
    (g) => g.completionPercentage === 100,
  ).length;
  const notStarted = goals.filter((g) => g.completionPercentage === 0).length;

  return (
    <div className="enhanced-goals-container">
      <div className="enhanced-goals">
        {/* ── Level 1: Top Bar (Brand, Stats, Global Actions) ── */}
        <header className="enhanced-goals__top-bar">
          <div className="enhanced-goals__header-left">
            {/* Logo / Title */}
            <div className="enhanced-goals__header-title">
              <h2>
                <span className="header-icon">G</span>
                Goals
              </h2>
            </div>

            {/* Inline stats */}
            <Stats stats={stats} />
          </div>

          {/* Actions */}
          <div className="enhanced-goals__actions">
            {selectedGoals?.length > 0 && (
              <BulkActions
                selectedGoals={selectedGoals}
                onDelete={handleBulkDelete}
                onStatusUpdate={handleBulkStatusUpdate}
                onArchive={handleBulkArchive}
                onUnarchive={handleBulkUnarchive}
                archiveStatus={archiveStatus}
              />
            )}

            <button
              className="enhanced-goals__export-btn"
              onClick={exportGoals}
              aria-label="Export goals"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>

            {/* Add goal — always visible in top bar */}
            <button
              className="enhanced-goals__add-btn"
              onClick={() => navigate("/goals/add")}
              aria-label="Add new goal"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Goal
            </button>
          </div>
        </header>

        {/* ── Level 2: Filter Toolbar (Search, Year, Archive, Status, Sort, View) ── */}
        <div className="enhanced-goals__toolbar">
          <SearchAndFilters
            setSearchTerm={setSearchTerm}
            setFilterStatus={setFilterStatus}
            setSortBy={setSortBy}
            setViewType={setViewType}
            sortBy={sortBy}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            availableYears={availableYears}
            archiveStatus={archiveStatus}
            setArchiveStatus={setArchiveStatus}
          />
        </div>

        {/* ── Main two-column area ── */}
        <div className="enhanced-goals__main">
          {/* Goals content */}
          <div className="enhanced-goals__content">{renderContent()}</div>

          {/* Right sidebar: chart + insights */}
          <div className="enhanced-goals__chart-container">
            {/* Use <p> not <h3> — these are labels, not document headings */}
            <p className="chart-section-title">Distribution</p>

            <div className="enhanced-goals__chart-wrapper">
              <DonutChart data={chartData} />
            </div>

            <div className="enhanced-goals__insights-wrapper">
              <p className="insights-title">Summary</p>
              <div className="insights-grid">
                <InsightCard label="Total" value={goals.length} />
                <InsightCard
                  label="Active"
                  value={activeGoals}
                  color="accent"
                />
                <InsightCard
                  label="Completed"
                  value={completedGoals}
                  color="green"
                />
                <InsightCard
                  label="Not started"
                  value={notStarted}
                  color="slate"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Insight card ─────────────────────────────────────────────── */
const VALUE_COLORS = {
  accent: "var(--accent)",
  green: "var(--green)",
  slate: "var(--slate)",
};

const InsightCard = ({ label, value, color }) => (
  <div className="insight-card">
    <div className="insight-card__label">{label}</div>
    <div
      className="insight-card__value"
      style={{ color: VALUE_COLORS[color] ?? "var(--text-primary)" }}
    >
      {value}
    </div>
  </div>
);

export default GoalList;
