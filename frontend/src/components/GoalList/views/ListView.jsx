// src/components/GoalList/views/ListView.jsx
import React, { useMemo } from "react";

/* ── Helpers ─────────────────────────────────────────────────── */
const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDueInfo = (endDate) => {
  if (!endDate) return null;
  const diffDays = Math.ceil((new Date(endDate) - new Date()) / 86_400_000);
  if (diffDays < 0) return { text: "Overdue", cls: "due--overdue" };
  if (diffDays === 0) return { text: "Due today", cls: "due--today" };
  if (diffDays <= 7) return { text: `${diffDays}d left`, cls: "due--soon" };
  if (diffDays <= 30) return { text: `${diffDays}d left`, cls: "due--normal" };
  return { text: `${diffDays}d left`, cls: "due--distant" };
};

/* ── Component ───────────────────────────────────────────────── */
export const ListView = ({
  goals,
  handleGoalSelect,
  tags,
  selectedGoals = [],
  navigate,
}) => (
  <div className="gl-table">
    {/* Column header */}
    <div className="gl-header">
      <div className="gl-col gl-col--check" />
      <div className="gl-col gl-col--goal">Goal</div>
      <div className="gl-col gl-col--priority">Priority</div>
      <div className="gl-col gl-col--category">Category</div>
      <div className="gl-col gl-col--due">Due</div>
      <div className="gl-col gl-col--progress">Progress</div>
    </div>

    {/* Rows */}
    {goals.map(
      (goal) =>
        !goal.archived && (
          <GoalRow
            key={goal._id}
            goal={goal}
            tags={tags}
            selected={selectedGoals.includes(goal._id)}
            onSelect={handleGoalSelect}
            onNavigate={navigate}
          />
        ),
    )}
  </div>
);

/* ── Single row ──────────────────────────────────────────────── */
const GoalRow = ({ goal, tags, selected, onSelect, onNavigate }) => {
  const tagNames = useMemo(
    () =>
      (goal.tags || [])
        .map((id) => tags?.find((t) => t._id === id)?.name)
        .filter(Boolean),
    [goal.tags, tags],
  );

  const dueInfo = getDueInfo(goal.duration?.endDate);
  const progressPct = goal.completionPercentage ?? 0;
  // Treat both the boolean `completed` field AND completionPercentage === 100 as done
  const isDone = goal.completed || progressPct === 100;

  const progressColor =
    progressPct === 100
      ? "var(--green)"
      : progressPct >= 50
        ? "var(--accent)"
        : progressPct > 0
          ? "var(--amber)"
          : "var(--border-strong)";

  // Guard: priority may be undefined/null from incomplete data
  const priorityCls = goal.priority
    ? `gl-priority--${goal.priority.toLowerCase()}`
    : "gl-priority--low";
  const priorityLabel = goal.priority ?? "Low";

  // Only render the chips row if there's actually something to show
  const hasChips =
    goal.duration?.startDate ||
    tagNames.length > 0 ||
    goal.createdAt ||
    goal.collaborators?.length > 0 ||
    goal.comments?.length > 0;

  return (
    <div
      className={`gl-row${selected ? " gl-row--selected" : ""}`}
      onClick={() => onNavigate(`/goals/${goal._id}`)}
    >
      {/* Checkbox */}
      <div
        className="gl-col gl-col--check"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className="gl-checkbox"
          checked={selected}
          onChange={() => onSelect(goal._id)}
          aria-label={`Select ${goal.title}`}
        />
      </div>

      {/* Goal — title + description + secondary chips */}
      <div className="gl-col gl-col--goal">
        <span className="gl-title">{goal.title}</span>

        {goal.description && (
          <span className="gl-desc">{goal.description}</span>
        )}

        {/* Only render chips row when there's content — avoids phantom margin */}
        {hasChips && (
          <div className="gl-chips">
            {goal.duration?.startDate && (
              <span className="gl-chip gl-chip--date">
                {formatDate(goal.duration.startDate)}
              </span>
            )}
            {tagNames.map((name) => (
              <span key={name} className="gl-chip gl-chip--tag">
                {name}
              </span>
            ))}
            {goal.createdAt && (
              <span className="gl-meta">
                Created {formatDate(goal.createdAt)}
              </span>
            )}
            {goal.collaborators?.length > 0 && (
              <span className="gl-meta">
                {goal.collaborators.length} collaborator
                {goal.collaborators.length !== 1 ? "s" : ""}
              </span>
            )}
            {goal.comments?.length > 0 && (
              <span className="gl-meta">
                {goal.comments.length} comment
                {goal.comments.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Priority */}
      <div className="gl-col gl-col--priority">
        <span className={`gl-priority ${priorityCls}`}>{priorityLabel}</span>
      </div>

      {/* Category */}
      <div className="gl-col gl-col--category">
        {goal.category ? (
          <span className="gl-chip gl-chip--cat">{goal.category}</span>
        ) : (
          <span className="gl-empty-cell">—</span>
        )}
      </div>

      {/* Due — prefer isDone over dueInfo so 100% goals show "Done" */}
      <div className="gl-col gl-col--due">
        {isDone ? (
          <span className="gl-due due--done">Done</span>
        ) : dueInfo ? (
          <span className={`gl-due ${dueInfo.cls}`}>{dueInfo.text}</span>
        ) : (
          <span className="gl-empty-cell">—</span>
        )}
      </div>

      {/* Progress */}
      <div className="gl-col gl-col--progress">
        <div className="gl-progress">
          <div className="gl-progress__track">
            <div
              className="gl-progress__fill"
              style={{ width: `${progressPct}%`, background: progressColor }}
            />
          </div>
          <span className="gl-progress__pct">{progressPct}%</span>
        </div>
      </div>
    </div>
  );
};

export default ListView;
