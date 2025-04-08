// src/components/GoalList/controls/SearchAndFilters.jsx
import React from "react";

export const SearchAndFilters = ({
  setSearchTerm,
  setFilterStatus,
  setSortBy,
  setViewType,
  sortBy,
}) => (
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
        value={sortBy}
      >
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
        <option value="completion">Completion %</option>
        <option value="alphabetical">Alphabetical</option>
        <option value="created">Creation Date</option>
        <option value="lastModified">Last Modified</option>
        <option value="thisWeek">This Week</option>
        <option value="thisMonth">This Month</option>
        <option value="thisYear">This Year</option>
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
  </div>
);

export default SearchAndFilters;
