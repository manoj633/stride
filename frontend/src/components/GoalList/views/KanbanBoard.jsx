const COLUMNS = [
  {
    id: "not-started",
    label: "Not Started",
    emoji: "💤",
    accentColor: "#94a3b8",
    filter: (g) => g.completionPercentage === 0,
  },
  {
    id: "in-progress",
    label: "In Progress",
    emoji: "🚀",
    accentColor: "#3b82f6",
    filter: (g) => g.completionPercentage > 0 && g.completionPercentage < 100,
  },
  {
    id: "completed",
    label: "Completed",
    emoji: "✅",
    accentColor: "#16a34a",
    filter: (g) => g.completionPercentage === 100,
  },
];

const KanbanBoard = ({ goals }) => (
  <div className="enhanced-goals__kanban">
    {COLUMNS.map((col) => {
      const colGoals = goals.filter(col.filter);
      return (
        <div key={col.id} className="kanban-column">
          <div
            className="kanban-column__header"
            style={{ borderBottomColor: `${col.accentColor}30` }}
          >
            <span className="kanban-column__emoji">{col.emoji}</span>
            <h3 className="kanban-column__title">{col.label}</h3>
            <span
              className="kanban-column__count"
              style={{
                background: `${col.accentColor}15`,
                color: col.accentColor,
                border: `1px solid ${col.accentColor}30`,
              }}
            >
              {colGoals.length}
            </span>
          </div>

          <div className="kanban-column__cards">
            {colGoals.length === 0 ? (
              <div className="kanban-column__empty">
                <span style={{ fontSize: "1.5rem", opacity: 0.4 }}>
                  {col.emoji}
                </span>
                <p>No goals here</p>
              </div>
            ) : (
              colGoals.map((goal) => (
                <div key={goal._id} className="kanban-card">
                  <div className="kanban-card__top">
                    <h4 className="kanban-card__title">{goal.title}</h4>
                    <span
                      className={`priority-badge ${goal.priority.toLowerCase()}`}
                    >
                      {goal.priority === "High" && "🔴"}
                      {goal.priority === "Medium" && "🟡"}
                      {goal.priority === "Low" && "🟢"} {goal.priority}
                    </span>
                  </div>
                  {goal.category && (
                    <span
                      className="category-badge"
                      style={{
                        fontSize: "0.7rem",
                        marginBottom: "0.75rem",
                        display: "inline-block",
                      }}
                    >
                      📁 {goal.category}
                    </span>
                  )}
                  {col.id !== "not-started" && (
                    <div className="kanban-card__progress">
                      <div className="kanban-card__progress-track">
                        <div
                          className="kanban-card__progress-bar"
                          style={{
                            width: `${goal.completionPercentage}%`,
                            background:
                              col.id === "completed"
                                ? "linear-gradient(90deg, #16a34a, #22c55e)"
                                : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                          }}
                        />
                      </div>
                      <span className="kanban-card__progress-pct">
                        {goal.completionPercentage}%
                      </span>
                    </div>
                  )}
                  {goal.duration?.endDate && col.id !== "completed" && (
                    <div className="kanban-card__due">
                      📅{" "}
                      {new Date(goal.duration.endDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export default KanbanBoard;
