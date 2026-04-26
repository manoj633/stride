// src/components/GoalList/Stats.jsx
import React from "react";

const STAT_CONFIG = [
  {
    key: "completionRate",
    label: "Completion",
    format: (v) => `${v.toFixed(1)}%`,
  },
  { key: "overdueGoals", label: "Overdue", format: (v) => v },
  { key: "monthlyGoals", label: "This month", format: (v) => v },
];

export const Stats = ({ stats }) => (
  <div className="goals__stats">
    {STAT_CONFIG.map(({ key, label, format }) => (
      <div key={key} className="stat-item">
        <h3>{label}</h3>
        <p>{format(stats[key])}</p>
      </div>
    ))}
  </div>
);

export default Stats;
