// RelatedGoals.jsx
import React from "react";

const RelatedGoals = ({ relatedGoals }) => (
  <div className="goal-description__related">
    <h3>Related Goals</h3>
    <div className="related-goals-list">
      {relatedGoals.map((goal) => (
        <div className="related-goal-item" key={goal.id}>
          <span className="goal-title">{goal.title}</span>
          <span className="goal-progress">{goal.progress}%</span>
        </div>
      ))}
    </div>
  </div>
);

export default RelatedGoals;
