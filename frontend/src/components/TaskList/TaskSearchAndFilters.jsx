// src/components/TaskList/TaskSearchAndFilters.jsx
import React from "react";

const TaskSearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  filterTag,
  setFilterTag,
  filterDateRange,
  setFilterDateRange,
  availableTags = [],
}) => (
  <div className="enhanced-tasks__controls">
    <input
      type="text"
      placeholder="Search tasks..."
      className="enhanced-goals__search-input"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    
    <div className="enhanced-goals__filters">
      {/* Date Range Group */}
      <div className="enhanced-tasks__date-group">
        <input
          type="date"
          className="enhanced-goals__filter-select"
          value={filterDateRange.start}
          onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
          title="Start Date"
        />
        <span className="date-separator">to</span>
        <input
          type="date"
          className="enhanced-goals__filter-select"
          value={filterDateRange.end}
          onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
          title="End Date"
        />
      </div>

      <select
        className="enhanced-goals__filter-select"
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
      >
        <option value="">All Tags</option>
        {availableTags.map((tag) => (
          <option key={tag._id || tag.id} value={tag._id || tag.id}>
            {tag.name}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default TaskSearchAndFilters;
