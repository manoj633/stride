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

const KanbanBoard = ({ goals, onUnarchive }) => (
  <div className="enhanced-goals__kanban">
    {COLUMNS.map((col) => {
      const colGoals = goals.filter(col.filter);
      return <KanbanColumn key={col.id} col={col} goals={colGoals} onUnarchive={onUnarchive} />;
    })}
  </div>
);

const KanbanColumn = ({ col, goals, onUnarchive }) => (
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
        goals.map((goal) => <KanbanCard key={goal._id} goal={goal} col={col} onUnarchive={onUnarchive} />)
      )}
    </div>
  </div>
);

const KanbanCard = ({ goal, col, onUnarchive }) => (
  <div className={`kanban-card${goal.archived ? " kanban-card--archived" : ""}`} style={goal.archived ? { opacity: 0.85 } : {}}>
    <div className="kanban-card__top">
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <h4 className="kanban-card__title">{goal.title}</h4>
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
      <span className={`priority-badge ${goal.priority ? goal.priority.toLowerCase() : "low"}`}>
        {goal.priority || "Low"}
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

    {/* Due date & Unarchive button */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
      {goal.duration?.endDate && col.id !== "completed" ? (
        <div className="kanban-card__due" style={{ margin: 0 }}>
          Due{" "}
          {new Date(goal.duration.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      ) : <span />}

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
  </div>
);

export default KanbanBoard;
