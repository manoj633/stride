// MetaInfo.jsx
import React from "react";

const MetaInfo = ({ goal }) => (
  <div className="goal-description__meta">
    <span className={`priority-badge ${goal.priority.toLowerCase()}`}>
      {goal.priority}
    </span>
    <span className={`category-badge ${goal.category.toLowerCase()}`}>
      {goal.category}
    </span>
    <span className={"due-date-badge"}>
      Start Date:{" "}
      {new Date(goal.duration.startDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}
    </span>
    <span
      className={`due-date-badge ${
        new Date(goal.duration.endDate) < new Date() ? "overdue" : ""
      }`}
    >
      Due By:{" "}
      {new Date(goal.duration.endDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}
    </span>
  </div>
);

export default MetaInfo;
