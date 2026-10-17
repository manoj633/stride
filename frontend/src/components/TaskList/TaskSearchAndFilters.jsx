// src/components/TaskList/TaskSearchAndFilters.jsx
import React from "react";
import { FiSearch, FiX, FiGlobe } from "react-icons/fi";

const TaskSearchAndFilters = ({
  searchTerm = "",
  setSearchTerm,
  filterPriority = "all",
  setFilterPriority,
  filterStatus = "all",
  setFilterStatus,
  filterTag,
  setFilterTag,
  filterDateRange,
  setFilterDateRange,
  availableTags = [],
  selectedYear,
  setSelectedYear,
  availableYears = [],
}) => (
  <div className="enhanced-tasks__controls">
    <div className="enhanced-tasks__search-wrapper" style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
      <input
        type="text"
        placeholder="Search tasks by name or description..."
        className="enhanced-goals__search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search tasks"
      />
      {searchTerm && (
        <button
          type="button"
          className="enhanced-goals__search-clear"
          onClick={() => setSearchTerm("")}
          aria-label="Clear task search"
        >
          <FiX size={15} />
        </button>
      )}
      {searchTerm.trim().length > 0 && selectedYear && selectedYear !== "all" && (
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
      {setSelectedYear && availableYears.length > 0 && (
        <select
          className="enhanced-goals__filter-select enhanced-tasks__year-select"
          value={selectedYear}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedYear(val === "all" ? "all" : parseInt(val, 10));
          }}
          aria-label="Filter tasks by year"
        >
          {availableYears.map((yr) => (
            <option key={yr} value={yr}>
              {yr === "all" ? "All Years" : yr}
            </option>
          ))}
        </select>
      )}

      {/* Priority Dropdown */}
      <select
        className="enhanced-goals__filter-select"
        value={filterPriority}
        onChange={(e) => setFilterPriority && setFilterPriority(e.target.value)}
        aria-label="Filter tasks by priority"
      >
        <option value="all">All Priorities</option>
        <option value="High">High Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="Low">Low Priority</option>
      </select>

      {/* Status Dropdown */}
      <select
        className="enhanced-goals__filter-select"
        value={filterStatus}
        onChange={(e) => setFilterStatus && setFilterStatus(e.target.value)}
        aria-label="Filter tasks by status"
      >
        <option value="all">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="in-progress">In Progress</option>
        <option value="not-started">Not Started</option>
      </select>

      {/* Tags Filter */}
      <select
        className="enhanced-goals__filter-select"
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
        aria-label="Filter tasks by tag"
      >
        <option value="">All Tags</option>
        {availableTags.map((tag) => (
          <option key={tag._id || tag.id} value={tag._id || tag.id}>
            {tag.name}
          </option>
        ))}
      </select>

      {/* Date Range Group */}
      <div className="enhanced-tasks__date-group">
        <input
          type="date"
          className="enhanced-goals__filter-select"
          value={filterDateRange?.start || ""}
          onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
          title="Start Date"
        />
        <span className="date-separator">to</span>
        <input
          type="date"
          className="enhanced-goals__filter-select"
          value={filterDateRange?.end || ""}
          onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
          title="End Date"
        />
      </div>
    </div>
  </div>
);

export default TaskSearchAndFilters;
