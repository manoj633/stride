// src/components/GoalList/controls/BulkActions.jsx
import React from "react";

export const BulkActions = ({
  selectedGoals,
  onDelete,
  onStatusUpdate,
  onArchive,
  onUnarchive,
  archiveStatus,
}) => (
  <div className="enhanced-goals__bulk-actions">
    <button onClick={onDelete} className="enhanced-goals__bulk-action-btn">
      Delete Selected ({selectedGoals.length})
    </button>
    <button
      onClick={onStatusUpdate}
      className="enhanced-goals__bulk-action-btn"
    >
      Update Status ({selectedGoals.length})
    </button>
    {archiveStatus !== "archived" && onArchive && (
      <button onClick={onArchive} className="enhanced-goals__bulk-action-btn">
        Archive Selected ({selectedGoals.length})
      </button>
    )}
    {archiveStatus !== "active" && onUnarchive && (
      <button onClick={onUnarchive} className="enhanced-goals__bulk-action-btn">
        Unarchive Selected ({selectedGoals.length})
      </button>
    )}
  </div>
);

export default BulkActions;
