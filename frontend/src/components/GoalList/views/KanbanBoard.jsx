// src/components/GoalList/views/KanbanBoard.jsx
import React from "react";

const COLUMNS = [
  {
    id: "not-started",
    label: "Not Started",
    accentColor: "var(--slate)",
    countStyle: {
      background: "var(--slate-light)",
      color: "var(--slate)",
      border: "1px solid var(--slate-border)",
    },
    filter: (g) => g.completionPercentage === 0,
  },
  {
    id: "in-progress",
    label: "In Progress",
    accentColor: "var(--accent)",
    countStyle: {
      background: "var(--accent-light)",
      color: "var(--accent)",
      border: "1px solid var(--accent-border)",
    },
    filter: (g) => g.completionPercentage > 0 && g.completionPercentage < 100,
  },
  {
    id: "completed",
    label: "Completed",
    accentColor: "var(--green)",
    countStyle: {
      background: "var(--green-light)",
      color: "var(--green)",
      border: "1px solid var(--green-border)",
    },
    filter: (g) => g.completionPercentage === 100,
  },
];

const KanbanBoard = ({ goals }) => (
  <div className="enhanced-goals__kanban">
    {COLUMNS.map((col) => {
      const colGoals = goals.filter(col.filter);
      return <KanbanColumn key={col.id} col={col} goals={colGoals} />;
    })}
  </div>
);

const KanbanColumn = ({ col, goals }) => (
  <div className="kanban-column">
    <div
      className="kanban-column__header"
      style={{ borderBottomColor: "var(--border)" }}
    >
      <h3 className="kanban-column__title">{col.label}</h3>
      <span className="kanban-column__count" style={col.countStyle}>
        {goals.length}
      </span>
    </div>

    <div className="kanban-column__cards">
      {goals.length === 0 ? (
        <div className="kanban-column__empty">
          <span>—</span>
          <p>No items</p>
        </div>
      ) : (
        goals.map((goal) => <KanbanCard key={goal._id} goal={goal} col={col} />)
      )}
    </div>
  </div>
);

const KanbanCard = ({ goal, col }) => (
  <div className="kanban-card">
    <div className="kanban-card__top">
      <h4 className="kanban-card__title">{goal.title}</h4>
      <span className={`priority-badge ${goal.priority.toLowerCase()}`}>
        {goal.priority}
      </span>
    </div>

    {goal.category && (
      <span
        className="category-badge"
        style={{ fontSize: "11px", alignSelf: "flex-start" }}
      >
        {goal.category}
      </span>
    )}

    {/* Progress bar for in-progress cards */}
    {col.id !== "not-started" && (
      <div className="kanban-card__progress">
        <div className="kanban-card__progress-track">
          <div
            className="kanban-card__progress-bar"
            style={{
              width: `${goal.completionPercentage}%`,
              background:
                col.id === "completed" ? "var(--green)" : "var(--accent)",
            }}
          />
        </div>
        <span className="kanban-card__progress-pct">
          {goal.completionPercentage}%
        </span>
      </div>
    )}

    {/* Due date — only for non-completed */}
    {goal.duration?.endDate && col.id !== "completed" && (
      <div className="kanban-card__due">
        Due{" "}
        {new Date(goal.duration.endDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </div>
    )}
  </div>
);

export default KanbanBoard;
