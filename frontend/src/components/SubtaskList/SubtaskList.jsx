// SubtaskList/SubtaskList.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { subtasksProvider } from "../../services/dataService";
import "./SubtaskList.css";

const SubtaskList = ({ subtasks: propSubtasks }) => {
  // If subtasks are passed as props (from TaskDescription), use those
  // Otherwise, fetch all subtasks and filter for current day
  const navigate = useNavigate();
  const subtasks =
    propSubtasks ||
    (() => {
      const allSubtasks = subtasksProvider();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return allSubtasks.filter((subtask) => {
        const subtaskDate = new Date(subtask.dueDate);
        subtaskDate.setHours(0, 0, 0, 0); // Reset time to start of day
        return subtaskDate.getTime() === today.getTime();
      });
    })();

  // SubtaskList.jsx
  // Component code
  if (subtasks.length === 0) {
    const handleNavigateToAdd = () => {
      navigate("/subtasks/add");
    };

    return (
      <div className="subtask-list">
        <div
          className="subtask-list__empty subtask-list__empty--clickable"
          onClick={handleNavigateToAdd}
        >
          <div className="subtask-list__empty-content">
            <div className="subtask-list__empty-text">
              No subtasks found for today
            </div>
            <div className="subtask-list__empty-action">
              Click to add a subtask
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subtask-list">
      {subtasks.map((subtask) => (
        <div key={subtask.id} className="subtask-list__item">
          <Link to={`/subtasks/${subtask.id}`} className="subtask-list__link">
            <div className="subtask-list__content">
              <span className="subtask-list__name">{subtask.name}</span>
              {subtask.status && (
                <span
                  className={`subtask-list__status subtask-list__status--${subtask.status.toLowerCase()}`}
                >
                  {subtask.status}
                </span>
              )}
              {subtask.dueDate && (
                <span className="subtask-list__date">{subtask.dueDate}</span>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SubtaskList;
