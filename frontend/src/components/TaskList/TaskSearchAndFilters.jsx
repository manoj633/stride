// src/components/TaskList/TaskSearchAndFilters.jsx
import React from "react";
import "./TaskSearchAndFilters.css";

const TaskSearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  filterTag,
  setFilterTag,
  filterCollaborator,
  setFilterCollaborator,
  filterDateRange,
  setFilterDateRange,
  availableTags = [],
  availableCollaborators = [],
}) => (
  <div className="tasklist-controls">
    <input
      type="text"
      placeholder="Search tasks..."
      className="tasklist-search-input"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <select
      className="tasklist-filter-select"
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
    <select
      className="tasklist-filter-select"
      value={filterCollaborator}
      onChange={(e) => setFilterCollaborator(e.target.value)}
    >
      <option value="">All Collaborators</option>
      {availableCollaborators.map((user) => (
        <option key={user._id || user.id} value={user._id || user.id}>
          {user.name || user.email}
        </option>
      ))}
    </select>
    <div className="tasklist-date-range">
      <label>
        Start:
        <input
          type="date"
          value={filterDateRange.start || ""}
          onChange={(e) =>
            setFilterDateRange((prev) => ({ ...prev, start: e.target.value }))
          }
        />
      </label>
      <label>
        End:
        <input
          type="date"
          value={filterDateRange.end || ""}
          onChange={(e) =>
            setFilterDateRange((prev) => ({ ...prev, end: e.target.value }))
          }
        />
      </label>
    </div>
  </div>
);

export default TaskSearchAndFilters;
