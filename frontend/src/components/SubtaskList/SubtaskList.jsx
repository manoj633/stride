// SubtaskList/SubtaskList.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchSubtasks } from "../../store/features/subtasks/subtaskSlice";
import "./SubtaskList.css";

const SubtaskList = ({ subtasks: propSubtasks }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const allSubtasks = useSelector((state) => state.subtasks.items);
  const loading = useSelector((state) => state.subtasks.loading);
  const error = useSelector((state) => state.subtasks.error);

  useEffect(() => {
    if (!propSubtasks) {
      dispatch(fetchSubtasks());
    }
  }, [dispatch, propSubtasks]);

  useEffect(() => {
    if (error === "Request failed with status code 401") {
      navigate("/login");
    }
  }, [error, navigate]);

  // Use propSubtasks if provided, otherwise filter today's subtasks from Redux store
  const subtasks =
    propSubtasks ||
    (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return allSubtasks.filter((subtask) => {
        const subtaskDate = new Date(subtask.dueDate);
        subtaskDate.setHours(0, 0, 0, 0);
        return subtaskDate.getTime() === today.getTime();
      });
    })();

  if (loading && !propSubtasks) {
    return <div className="subtask-list">Loading...</div>;
  }

  if (subtasks.length === 0) {
    return (
      <div className="subtask-list">
        <div
          className="subtask-list__empty subtask-list__empty--clickable"
          onClick={() => navigate("/subtasks/add")}
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
        <div
          key={subtask._id}
          className={`subtask-list__link ${
            subtask.completed
              ? "subtask-list__link--completed"
              : "subtask-list__link--not-completed"
          }`}
        >
          <Link to={`/subtasks/${subtask._id}`} className="subtask-list__link">
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
                <span className="subtask-list__date">
                  {new Date(subtask.dueDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SubtaskList;
