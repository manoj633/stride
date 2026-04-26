// src/components/GoalList/views/TimelineView.jsx
import React from "react";

const TimelineView = ({ goals }) => {
  const sorted = [...goals]
    .filter((g) => g.duration?.startDate)
    .sort(
      (a, b) => new Date(a.duration.startDate) - new Date(b.duration.startDate),
    );

  if (sorted.length === 0) {
    return (
      <div className="timeline-empty">
        <span>○</span>
        <p>No goals match your filters</p>
      </div>
    );
  }

  return (
    <div className="enhanced-goals__timeline">
      {sorted.map((goal) => (
        <div key={goal._id} className="timeline-item">
          <div className="timeline-content">
            <div className="timeline-date">
              {fmtDate(goal.duration.startDate)}
              {goal.duration?.endDate && ` → ${fmtDate(goal.duration.endDate)}`}
            </div>

            <h4>{goal.title}</h4>

            {goal.description && (
              <p className="timeline-description">{goal.description}</p>
            )}

            <div className="timeline-progress">
              <div
                className="progress-bar"
                style={{ width: `${goal.completionPercentage}%` }}
              />
            </div>

            <div className="timeline-footer">
              <span className={`priority-badge ${goal.priority.toLowerCase()}`}>
                {goal.priority}
              </span>
              {goal.category && (
                <span className="category-badge">{goal.category}</span>
              )}
              <span className="timeline-pct">{goal.completionPercentage}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default TimelineView;
