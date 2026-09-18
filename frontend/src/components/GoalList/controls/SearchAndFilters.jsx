// src/components/GoalList/controls/SearchAndFilters.jsx
import React from "react";

export const SearchAndFilters = ({
  setSearchTerm,
  setFilterStatus,
  setSortBy,
  setViewType,
  sortBy,
  selectedYear,
  setSelectedYear,
  availableYears,
  archiveStatus,
  setArchiveStatus,
}) => (
  <div className="enhanced-goals__controls">
    <div className="enhanced-goals__search-wrapper">
      <input
        type="text"
        placeholder="Search goals..."
        className="enhanced-goals__search-input"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    <div className="enhanced-goals__filters">
      {/* Year Picker */}
      <select
        className="enhanced-goals__filter-select enhanced-goals__year-select"
        value={selectedYear}
        onChange={(e) => {
          const val = e.target.value;
          setSelectedYear(val === "all" ? "all" : parseInt(val, 10));
        }}
        aria-label="Filter goals by year"
      >
        {availableYears?.map((yr) => (
          <option key={yr} value={yr}>
            {yr === "all" ? "All Years" : yr}
          </option>
        ))}
      </select>

      {/* Independent Archive Axis */}
      <select
        className="enhanced-goals__filter-select enhanced-goals__archive-select"
        value={archiveStatus}
        onChange={(e) => setArchiveStatus(e.target.value)}
        aria-label="Filter goals by archive status"
      >
        <option value="active">Active</option>
        <option value="archived">Archived</option>
        <option value="all">All (Active + Archived)</option>
      </select>

      {/* Status Filter */}
      <select
        className="enhanced-goals__filter-select"
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="all">All Statuses</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="overdue">Overdue</option>
      </select>

      {/* Sort By */}
      <select
        className="enhanced-goals__sort-select"
        onChange={(e) => setSortBy(e.target.value)}
        value={sortBy}
      >
        <option value="lastModified">Sort: Last Modified</option>
        <option value="dueDate">Sort: Due Date</option>
        <option value="priority">Sort: Priority</option>
        <option value="completion">Sort: Completion %</option>
        <option value="alphabetical">Sort: Alphabetical</option>
        <option value="created">Sort: Creation Date</option>
        <option value="thisWeek">Sort: This Week</option>
        <option value="thisMonth">Sort: This Month</option>
        <option value="thisYear">Sort: This Year</option>
      </select>

      {/* View Switcher */}
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
