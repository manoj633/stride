// SubtaskList/SubtaskList.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchSubtasks } from "../../store/features/subtasks/subtaskSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import "./SubtaskList.css";

const SubtaskList = ({ subtasks: propSubtasks }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allSubtasks = useSelector((state) => state.subtasks.items);
  const loading = useSelector((state) => state.subtasks.loading);
  const error = useSelector((state) => state.subtasks.error);

  useEffect(() => {
    if (!propSubtasks && allSubtasks.length === 0) {
      dispatch(fetchSubtasks());
    }
  }, [dispatch, propSubtasks, allSubtasks.length]);

  useEffect(() => {
    if (error === "Request failed with status code 401") {
      navigate("/login");
    }
  }, [error, navigate]);

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

  if (loading) return <LoadingSpinner message="Loading subtasks..." />;
  if (error) return <ErrorMessage message={error} />;

  if (subtasks.length === 0) {
    return (
      <div className="subtask-list">
        <div
          className="subtask-list__empty"
          onClick={() => navigate("/tasks/add")}
          role="button"
          tabIndex={0}
          aria-label="Add your first task"
        >
          <p className="subtask-list__empty-text">
            No subtasks yet! ✨ Time to get productive! 🚀
          </p>
          <p className="subtask-list__empty-action">
            Click here to add your first task! ➕
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="subtask-list">
      {subtasks.map((subtask) => (
        <Link
          key={subtask._id}
          to={`/subtasks/${subtask._id}`}
          className="subtask-list__item-link"
          aria-label={`View details for subtask ${subtask.name}`}
        >
          <div
            className={`subtask-list__item ${
              subtask.completed ? "subtask-list__item--completed" : ""
            }`}
          >
            <div className="subtask-list__content">
              <h3 className="subtask-list__title">
                {subtask.name}
                {subtask.priority === "High" && <span> 🔥</span>}
              </h3>
              {subtask.description && (
                <p className="subtask-list__description">
                  {subtask.description}
                </p>
              )}
            </div>
            <div className="subtask-list__meta">
              <span
                className={`subtask-list__status ${
                  subtask.completed ? "completed" : "pending"
                }`}
              >
                {subtask.completed ? "Completed" : "Pending"}
              </span>
              {subtask.dueDate && (
                <span className="subtask-list__date">
                  {new Date(subtask.dueDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SubtaskList;
