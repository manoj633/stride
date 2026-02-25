// src/components/GoalList/views/ListView.jsx
import React from "react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDaysRemaining = (endDate) => {
  if (!endDate) return null;
  const diffDays = Math.ceil((new Date(endDate) - new Date()) / 86400000);
  if (diffDays < 0) return { text: "Overdue", color: "#dc2626", emoji: "🚨" };
  if (diffDays === 0)
    return { text: "Due Today", color: "#f59e0b", emoji: "⚡" };
  if (diffDays <= 7)
    return { text: `${diffDays}d left`, color: "#f59e0b", emoji: "⏰" };
  if (diffDays <= 30)
    return { text: `${diffDays}d left`, color: "#3b82f6", emoji: "📅" };
  return { text: `${diffDays}d left`, color: "#64748b", emoji: "📆" };
};

const DueBadge = ({ endDate }) => {
  const info = getDaysRemaining(endDate);
  if (!info) return null;
  return (
    <div
      className="due-badge"
      style={{
        background: `${info.color}15`,
        color: info.color,
        border: `1px solid ${info.color}30`,
      }}
    >
      <span>{info.emoji}</span>
      <span>{info.text}</span>
    </div>
  );
};

export const ListView = ({
  goals,
  handleGoalSelect,
  tags,
  selectedGoals,
  navigate,
}) => (
  <div className="enhanced-goals__list">
    {goals.map(
      (goal) =>
        !goal.archived && (
          <div
            className={`enhanced-goals__item ${selectedGoals.includes(goal._id) ? "selected" : ""}`}
            key={goal._id}
          >
            <input
              type="checkbox"
              checked={selectedGoals.includes(goal._id)}
              onChange={() => handleGoalSelect(goal._id)}
              onClick={(e) => e.stopPropagation()}
            />

            <div
              className="enhanced-goals__item-content"
              onClick={() => navigate(`/goals/${goal._id}`)}
            >
              {/* Title row */}
              <div className="enhanced-goals__item-titlerow">
                <span className="enhanced-goals__item-title">{goal.title}</span>
                {goal.duration?.endDate && (
                  <DueBadge endDate={goal.duration.endDate} />
                )}
              </div>

              {/* Description */}
              {goal.description && (
                <p className="enhanced-goals__item-description">
                  {goal.description}
                </p>
              )}

              {/* Badges row */}
              <div className="enhanced-goals__item-details">
                <span
                  className={`priority-badge ${goal.priority.toLowerCase()}`}
                >
                  {goal.priority === "High" && "🔴"}
                  {goal.priority === "Medium" && "🟡"}
                  {goal.priority === "Low" && "🟢"} {goal.priority}
                </span>
                <span className="category-badge">📁 {goal.category}</span>
                {goal.duration?.startDate && (
                  <span className="date-badge">
                    🗓️ {formatDate(goal.duration.startDate)}
                  </span>
                )}
                {goal.tags?.map((tag) => (
                  <span key={tag} className="tag-badge">
                    🏷️ {tags?.find((t) => t._id === tag)?.name}
                  </span>
                ))}
              </div>

              {/* Progress bar */}
              <div className="enhanced-goals__item-progress">
                <div
                  className="enhanced-goals__item-progress-bar"
                  style={{ width: `${goal.completionPercentage}%` }}
                />
                <span className="progress-text">
                  {goal.completionPercentage}%
                </span>
              </div>

              {/* Meta row */}
              <div className="enhanced-goals__item-meta">
                {goal.collaborators?.length > 0 && (
                  <span>
                    👥 {goal.collaborators.length} collaborator
                    {goal.collaborators.length > 1 ? "s" : ""}
                  </span>
                )}
                {goal.comments?.length > 0 && (
                  <span>
                    💬 {goal.comments.length} comment
                    {goal.comments.length > 1 ? "s" : ""}
                  </span>
                )}
                {goal.createdAt && (
                  <span>📝 Created {formatDate(goal.createdAt)}</span>
                )}
                {goal.completed && (
                  <span className="completed-badge">✅ Completed</span>
                )}
              </div>
            </div>
          </div>
        ),
    )}
  </div>
);

export default ListView;
