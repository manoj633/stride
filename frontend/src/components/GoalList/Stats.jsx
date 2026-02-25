// src/components/GoalList/Stats.jsx
import React from "react";

const STAT_CONFIG = [
  {
    key: "completionRate",
    label: "Completion",
    emoji: "✅",
    color: "#3b82f6",
    format: (v) => `${v.toFixed(1)}%`,
  },
  {
    key: "overdueGoals",
    label: "Overdue",
    emoji: "⏰",
    color: "#dc2626",
    format: (v) => v,
  },
  {
    key: "monthlyGoals",
    label: "This Month",
    emoji: "📅",
    color: "#8b5cf6",
    format: (v) => v,
  },
];

export const Stats = ({ stats }) => (
  <div className="goals__stats">
    {STAT_CONFIG.map(({ key, label, emoji, color, format }) => (
      <div key={key} className="stat-item">
        <h3>
          <span className="stat-item__emoji">{emoji}</span>
          {label}
        </h3>
        <p style={{ color }}>{format(stats[key])}</p>
      </div>
    ))}
  </div>
);

export default Stats;
