// src/components/GoalList/views/TimelineView.jsx
import React from "react";

const TimelineView = ({ goals }) => {
  const sortedGoals = [...goals]
    .filter((g) => g.duration?.startDate)
    .sort(
      (a, b) => new Date(a.duration.startDate) - new Date(b.duration.startDate),
    );

  if (sortedGoals.length === 0) {
    return (
      <div className="timeline-empty">
        <span>🗂️</span>
        <p>No goals match your current filters</p>
      </div>
    );
  }

  return (
    <div className="enhanced-goals__timeline">
      {sortedGoals.map((goal) => (
        <div key={goal._id} className="timeline-item">
          <div className="timeline-content">
            <div className="timeline-date">
              {new Date(goal.duration.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              {goal.duration?.endDate && (
                <>
                  {" "}
                  —{" "}
                  {new Date(goal.duration.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </>
              )}
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
                {goal.priority === "High" && "🔴"}
                {goal.priority === "Medium" && "🟡"}
                {goal.priority === "Low" && "🟢"} {goal.priority}
              </span>
              {goal.category && (
                <span className="category-badge">📁 {goal.category}</span>
              )}
              <span className="timeline-pct">
                {goal.completionPercentage}% Complete
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView;
