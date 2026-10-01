// src/components/SubtaskList/SubtaskSearchAndFilters.jsx
import React from "react";

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
  searchTerm,
  setSearchTerm,
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
    <div className="enhanced-subtasks__search-wrapper">
      <input
        type="text"
        placeholder="Search subtasks..."
        className="enhanced-goals__search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
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

export default SubtaskSearchAndFilters;
