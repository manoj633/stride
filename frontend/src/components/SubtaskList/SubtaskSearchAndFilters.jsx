// src/components/SubtaskList/SubtaskSearchAndFilters.jsx
import React from "react";
import { FiX, FiGlobe } from "react-icons/fi";

const MONTHS = [
  { value: "all", label: "All Months" },
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const SubtaskSearchAndFilters = ({
  searchTerm = "",
  setSearchTerm,
  filterPriority = "all",
  setFilterPriority,
  filterStatus = "all",
  setFilterStatus,
  filterTag,
  setFilterTag,
  availableTags = [],
  selectedYear,
  setSelectedYear,
  availableYears = [],
  selectedMonth,
  setSelectedMonth,
}) => (
  <div className="enhanced-subtasks__controls">
    <div className="enhanced-subtasks__search-wrapper" style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
      <input
        type="text"
        placeholder="Search subtasks by name or description..."
        className="enhanced-goals__search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search subtasks"
      />
      {searchTerm && (
        <button
          type="button"
          className="enhanced-goals__search-clear"
          onClick={() => setSearchTerm("")}
          aria-label="Clear subtask search"
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
      {/* Month Picker */}
      {setSelectedMonth && (
        <select
          className="enhanced-goals__filter-select enhanced-subtasks__month-select"
          value={selectedMonth}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedMonth(val === "all" ? "all" : parseInt(val, 10));
          }}
          aria-label="Filter subtasks by month"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      )}

      {/* Year Picker */}
      {setSelectedYear && availableYears.length > 0 && (
        <select
          className="enhanced-goals__filter-select enhanced-subtasks__year-select"
          value={selectedYear}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedYear(val === "all" ? "all" : parseInt(val, 10));
          }}
          aria-label="Filter subtasks by year"
        >
          {availableYears.map((yr) => (
            <option key={yr} value={yr}>
              {yr === "all" ? "All Years" : yr}
            </option>
          ))}
        </select>
      )}

      {/* Priority Filter */}
      <select
        className="enhanced-goals__filter-select"
        value={filterPriority}
        onChange={(e) => setFilterPriority && setFilterPriority(e.target.value)}
        aria-label="Filter subtasks by priority"
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
        onChange={(e) => setFilterStatus && setFilterStatus(e.target.value)}
        aria-label="Filter subtasks by status"
      >
        <option value="all">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
      </select>

      {/* Tags Filter */}
      <select
        className="enhanced-goals__filter-select"
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
        aria-label="Filter subtasks by tag"
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

export default SubtaskSearchAndFilters;
