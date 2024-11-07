import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  subtasksProvider,
  updateSubtaskCompletionStatus,
} from "../../services/dataService";
import "./SubtaskDescription.css";

const SubtaskDescription = () => {
  const { subtaskId } = useParams();
  const subtasks = subtasksProvider();
  const subtask = subtasks.find((st) => st.id === subtaskId);

  const [completed, setCompleted] = useState(
    subtask ? subtask.completed : false
  );

  const handleCheckboxChange = () => {
    const newCompletedStatus = !completed;
    setCompleted(newCompletedStatus);
    updateSubtaskCompletionStatus(subtaskId, newCompletedStatus);
  };

  if (!subtask) {
    return (
      <div className="subtask-empty">
        <div className="subtask-empty__message">
          <span className="subtask-empty__icon">🔍</span>
          <h3 className="subtask-empty__text">Subtask not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="subtask">
      <div className="subtask__header">
        <div className="subtask__status">
          <input
            type="checkbox"
            className="subtask__checkbox"
            checked={completed}
            onChange={handleCheckboxChange}
            id="subtask-status"
          />
          <label htmlFor="subtask-status" className="subtask__status-label">
            {completed ? "Completed" : "Mark as complete"}
          </label>
        </div>
        <h2 className="subtask__title">{subtask.name}</h2>
      </div>

      <div className="subtask__content">
        <div className="subtask__info-card">
          <div className="subtask__info-item">
            <span className="subtask__info-label">Due Date</span>
            <span className="subtask__info-value">{subtask.dueDate}</span>
          </div>

          <div className="subtask__info-item">
            <span className="subtask__info-label">Description</span>
            <p className="subtask__info-value subtask__info-value--description">
              {subtask.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtaskDescription;
