// src/components/GoalList/controls/SearchAndFilters.jsx
import React from "react";
import { FiSearch, FiX, FiGlobe } from "react-icons/fi";

export const SearchAndFilters = ({
  searchTerm = "",
  setSearchTerm,
  filterStatus = "all",
  setFilterStatus,
  filterPriority = "all",
  setFilterPriority,
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
      <FiSearch className="enhanced-goals__search-icon" size={16} />
      <input
        type="text"
        placeholder="Search goals by title, description, or category..."
        className="enhanced-goals__search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search goals"
      />
      {searchTerm && (
        <button
          type="button"
          className="enhanced-goals__search-clear"
          onClick={() => setSearchTerm("")}
          aria-label="Clear search"
        >
          <FiX size={15} />
        </button>
      )}
      {searchTerm.trim().length > 0 && selectedYear !== "all" && (
        <button
          type="button"
          className="enhanced-goals__search-all-years-pill"
          onClick={() => setSelectedYear("all")}
          title="Search across all years"
        >
          <FiGlobe size={12} />
          <span>Search all years</span>
        </button>
      )}
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

      {/* Priority Filter */}
      <select
        className="enhanced-goals__filter-select enhanced-goals__priority-select"
        value={filterPriority}
        onChange={(e) => setFilterPriority && setFilterPriority(e.target.value)}
        aria-label="Filter goals by priority"
      >
        <option value="all">All Priorities</option>
        <option value="High">High Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="Low">Low Priority</option>
      </select>

      {/* Status Filter */}
      <select
        className="enhanced-goals__filter-select"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        aria-label="Filter goals by status"
      >
        <option value="all">All Statuses</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="overdue">Overdue</option>
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

      {/* Sort By */}
      <select
        className="enhanced-goals__sort-select"
        onChange={(e) => setSortBy(e.target.value)}
        value={sortBy}
        aria-label="Sort goals"
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
        aria-label="Switch view"
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
