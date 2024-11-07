// Actions.jsx
import React from "react";

const Actions = ({ onEdit, onDelete }) => (
  <div className="goal-description__actions">
    <button className="edit-button" onClick={onEdit}>
      <i className="fas fa-edit"></i> Edit Goal
    </button>
    <button className="delete-button" onClick={onDelete}>
      <i className="fas fa-trash"></i> Delete Goal
    </button>
  </div>
);

export default Actions;
