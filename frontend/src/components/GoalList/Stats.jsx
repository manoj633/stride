// src/components/GoalList/Stats.jsx
import React from "react";

export const Stats = ({ stats }) => (
  <div className="goals__stats">
    <div className="stat-item">
      <h3>Completion</h3>
      <p>{stats.completionRate.toFixed(1)}%</p>
    </div>
    <div className="stat-item">
      <h3>Overdue</h3>
      <p>{stats.overdueGoals}</p>
    </div>
    <div className="stat-item">
      <h3>This Month</h3>
      <p>{stats.monthlyGoals}</p>
    </div>
  </div>
);

export default Stats;
