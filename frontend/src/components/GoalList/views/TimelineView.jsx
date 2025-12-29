// src/components/GoalList/views/TimelineView.jsx
import React from "react";

const TimelineView = ({ goals }) => {
  const sortedGoals = [...goals].sort(
    (a, b) => new Date(a.duration.startDate) - new Date(b.duration.startDate)
  );

  return (
    <div className="enhanced-goals__timeline">
      {sortedGoals.length > 0 ? (
        sortedGoals.map((goal) => (
          <div key={goal._id} className="timeline-item">
            <div className="timeline-content">
              <div className="timeline-date">
                {new Date(goal.duration.startDate).toLocaleDateString()} -{" "}
                {new Date(goal.duration.endDate).toLocaleDateString()}
              </div>
              <h4>{goal.title}</h4>
              <div className="timeline-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${goal.completionPercentage}%` }}
                ></div>
              </div>
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span
                  className={`priority-badge ${goal.priority.toLowerCase()}`}
                >
                  {goal.priority}
                </span>
                <span
                  style={{
                    fontSize: "0.95rem",
                    color: "#0ea5e9",
                    fontWeight: "700",
                  }}
                >
                  {goal.completionPercentage}% Complete
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div
          style={{
            padding: "4rem",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "1.1rem",
            fontWeight: "600",
          }}
        >
          No goals match your current filters
        </div>
      )}
    </div>
  );
};

export default TimelineView;
