// src/components/GoalList/views/ListView.jsx
import React from "react";

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
              <span className="enhanced-goals__item-title">{goal.title}</span>
              <div className="enhanced-goals__item-details">
                <span
                  className={`priority-badge ${goal.priority.toLowerCase()}`}
                >
                  {goal.priority}
                </span>
                <span className="category-badge">{goal.category}</span>
                {goal.tags &&
                  goal.tags.map((tag) => (
                    <span key={tag} className="tag-badge">
                      {tags?.find((t) => t._id === tag)?.name}
                    </span>
                  ))}
              </div>
              <div className="enhanced-goals__item-progress">
                <div
                  className="enhanced-goals__item-progress-bar"
                  style={{ width: `${goal.completionPercentage}%` }}
                ></div>
                <span className="progress-text">
                  {goal.completionPercentage}%
                </span>
              </div>
            </div>
          </div>
        )
    )}
  </div>
);

export default ListView;
