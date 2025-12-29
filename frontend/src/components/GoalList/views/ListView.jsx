// src/components/GoalList/views/ListView.jsx
import React from "react";

export const ListView = ({
  goals,
  handleGoalSelect,
  tags,
  selectedGoals,
  navigate,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", color: "#dc2626", emoji: "🚨" };
    if (diffDays === 0)
      return { text: "Due Today", color: "#f59e0b", emoji: "⚡" };
    if (diffDays <= 7)
      return { text: `${diffDays}d left`, color: "#f59e0b", emoji: "⏰" };
    if (diffDays <= 30)
      return { text: `${diffDays}d left`, color: "#3b82f6", emoji: "📅" };
    return { text: `${diffDays}d left`, color: "#64748b", emoji: "📆" };
  };

  return (
    <div className="enhanced-goals__list">
      {goals.map(
        (goal) =>
          !goal.archived && (
            <div
              className={`enhanced-goals__item ${
                selectedGoals.includes(goal._id) ? "selected" : ""
              }`}
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span className="enhanced-goals__item-title">
                    {goal.title}
                  </span>
                  {goal.duration?.endDate && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: `${
                          getDaysRemaining(goal.duration.endDate)?.color
                        }15`,
                        color: getDaysRemaining(goal.duration.endDate)?.color,
                        border: `1px solid ${
                          getDaysRemaining(goal.duration.endDate)?.color
                        }30`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span>
                        {getDaysRemaining(goal.duration.endDate)?.emoji}
                      </span>
                      <span>
                        {getDaysRemaining(goal.duration.endDate)?.text}
                      </span>
                    </div>
                  )}
                </div>

                {goal.description && (
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      marginBottom: "0.75rem",
                      lineHeight: "1.5",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {goal.description}
                  </div>
                )}

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
                    <span
                      style={{
                        padding: "0.35rem 0.85rem",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: "rgba(100, 116, 139, 0.1)",
                        color: "#64748b",
                        border: "1px solid rgba(100, 116, 139, 0.2)",
                      }}
                    >
                      🗓️ {formatDate(goal.duration.startDate)}
                    </span>
                  )}
                  {goal.tags &&
                    goal.tags.map((tag) => (
                      <span key={tag} className="tag-badge">
                        🏷️ {tags?.find((t) => t._id === tag)?.name}
                      </span>
                    ))}
                </div>

                {/* Progress Bar with Percentage */}
                <div className="enhanced-goals__item-progress">
                  <div
                    className="enhanced-goals__item-progress-bar"
                    style={{ width: `${goal.completionPercentage}%` }}
                  ></div>
                  <span className="progress-text">
                    {goal.completionPercentage}%
                  </span>
                </div>

                {/* Additional Meta Information */}
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "0.75rem",
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    flexWrap: "wrap",
                  }}
                >
                  {goal.collaborators && goal.collaborators.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <span>👥</span>
                      <span>
                        {goal.collaborators.length} collaborator
                        {goal.collaborators.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  {goal.comments && goal.comments.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <span>💬</span>
                      <span>
                        {goal.comments.length} comment
                        {goal.comments.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  {goal.createdAt && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <span>📝</span>
                      <span>Created {formatDate(goal.createdAt)}</span>
                    </div>
                  )}
                  {goal.completed && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        color: "#16a34a",
                        fontWeight: 600,
                      }}
                    >
                      <span>✅</span>
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
      )}
    </div>
  );
};

export default ListView;
