// TaskList.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchTasks } from "../../store/features/tasks/taskSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import "./TaskList.css";
import { toast } from "react-toastify";

const TaskList = ({ tasks: propTasks }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allTasks = useSelector((state) => state.tasks.items);
  const loading = useSelector((state) => state.tasks.loading);
  const error = useSelector((state) => state.tasks.error);

  useEffect(() => {
    if (!propTasks && allTasks.length === 0) {
      dispatch(fetchTasks())
        .unwrap()
        .catch((error) => {
          console.error("Failed to fetch tasks:", error);
          toast.error("Failed to fetch tasks");
        });
    }
  }, [dispatch, propTasks, allTasks.length]);

  useEffect(() => {
    if (error === "Request failed with status code 401") {
      navigate("/login");
    }
  }, [error, navigate]);

  const tasks =
    propTasks ||
    (() => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      return allTasks.filter((task) => {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = new Date(task.endDate);

        const startsInCurrentMonth =
          taskStartDate >= startOfMonth && taskStartDate <= endOfMonth;
        const endsInCurrentMonth =
          taskEndDate >= startOfMonth && taskEndDate <= endOfMonth;

        return startsInCurrentMonth || endsInCurrentMonth;
      });
    })();

  if (loading) return <LoadingSpinner message="Loading tasks..." />;
  if (error) return <ErrorMessage message={error} />;

  if (tasks.length === 0) {
    return (
      <div className="task-list">
        <div
          className="task-list__empty"
          onClick={() => navigate("/tasks/add")}
          role="button"
          tabIndex={0}
          aria-label="Add your first task"
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/tasks/add");
          }}
        >
          <p className="task-list__empty-text">
            No tasks yet! ✨ Time to get productive! 🚀
          </p>
          <p className="task-list__empty-action">
            Click here to add your first task! ➕
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <Link
          key={task._id}
          to={`/tasks/${task._id}`}
          className="task-list__item-link"
          aria-label={`View details for task: ${task.name}${
            task.priority === "High" ? ", high priority" : ""
          }`}
        >
          <div className="task-list__item">
            <div className="task-list__content">
              <h3 className="task-list__title">
                {task.name}
                {task.priority === "High" && <span> 🔥</span>}
              </h3>
              {task.description && (
                <p className="task-list__description">{task.description}</p>
              )}
            </div>
            <div className="task-list__meta">
              <span
                className={`task-list__priority ${
                  task.priority.toLowerCase() === "high"
                    ? "high"
                    : task.priority.toLowerCase() === "medium"
                    ? "medium"
                    : "low"
                }`}
                aria-label={`Priority: ${task.priority}`}
              >
                {task.priority}
              </span>
              <span
                className="task-list__date"
                aria-label={`Due date: ${task.dueDate}`}
              >
                {task.dueDate}
              </span>
              <div className="task-list__progress-container">
                <span
                  className="task-list__progress-label"
                  aria-label={`Completion: ${task.completionPercentage}%`}
                >
                  {task.completionPercentage}%
                </span>
                <div className="task-list__progress-bar">
                  <div
                    className="task-list__progress-bar-fill"
                    style={{
                      width: `${task.completionPercentage}%`,
                      backgroundColor:
                        task.completionPercentage === 100
                          ? "#4ade80"
                          : task.priority.toLowerCase() === "high"
                          ? "#f87171"
                          : task.priority.toLowerCase() === "medium"
                          ? "#fbb6ce"
                          : "#cbd5e1",
                    }}
                    aria-label={`Progress bar: ${task.completionPercentage}% complete`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default TaskList;
