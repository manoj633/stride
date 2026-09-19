// src/components/GoalList/views/TimelineView.jsx
import React from "react";

const TimelineView = ({ goals, onUnarchive }) => {
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
        <div key={goal._id} className="timeline-item" style={goal.archived ? { opacity: 0.85 } : {}}>
          <div className="timeline-content">
            <div className="timeline-date">
              {fmtDate(goal.duration.startDate)}
              {goal.duration?.endDate && ` → ${fmtDate(goal.duration.endDate)}`}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h4 style={{ margin: 0 }}>{goal.title}</h4>
              {goal.archived && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "1px 5px",
                    borderRadius: "3px",
                    background: "var(--bg-subtle, #f1f5f9)",
                    color: "var(--text-tertiary, #64748b)",
                    border: "1px solid var(--border, #e2e8f0)",
                  }}
                >
                  Archived
                </span>
              )}
            </div>

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
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  className={`priority-badge ${
                    goal.priority ? goal.priority.toLowerCase() : "low"
                  }`}
                >
                  {goal.priority || "Low"}
                </span>
                {goal.category && (
                  <span className="category-badge">{goal.category}</span>
                )}
                {goal.archived && onUnarchive && (
                  <button
                    type="button"
                    className="gl-unarchive-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnarchive(goal._id);
                    }}
                    title="Unarchive goal"
                  >
                    Unarchive
                  </button>
                )}
              </div>
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
