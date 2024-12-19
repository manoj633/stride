// TaskList.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchTasks } from "../../store/features/tasks/taskSlice";
import "./TaskList.css";

const TaskList = ({ tasks: propTasks }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get tasks from Redux store
  const allTasks = useSelector((state) => state.tasks.items);
  const loading = useSelector((state) => state.tasks.loading);
  const error = useSelector((state) => state.tasks.error);

  useEffect(() => {
    if (!propTasks) {
      dispatch(fetchTasks());
    }
  }, [dispatch, propTasks]);

  useEffect(() => {
    if (error === "Request failed with status code 401") {
      navigate("/login");
    }
  }, [error, navigate]);

  // If tasks are passed as props (from GoalDescription), use those
  // Otherwise, filter tasks from Redux store for current month
  const tasks =
    propTasks ||
    (() => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      return allTasks.filter((task) => {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = new Date(task.endDate);

        // Check if either the start date or the end date falls within the current month
        const startsInCurrentMonth =
          taskStartDate >= startOfMonth && taskStartDate <= endOfMonth;
        const endsInCurrentMonth =
          taskEndDate >= startOfMonth && taskEndDate <= endOfMonth;

        return startsInCurrentMonth || endsInCurrentMonth;
      });
    })();

  if (loading && !propTasks) {
    return (
      <div className="task-list">
        <div className="task-list--loading"></div>
        <div className="task-list--loading"></div>
        <div className="task-list--loading"></div>
      </div>
    );
  }

  // Empty state handling
  if (tasks.length === 0) {
    const handleNavigateToAdd = () => {
      navigate("/tasks/add");
    };

    return (
      <div className="task-list">
        <div
          className="task-list__empty task-list__empty--clickable"
          onClick={handleNavigateToAdd}
        >
          <div className="task-list__empty-content">
            <div className="task-list__empty-text">
              No tasks found for today
            </div>
            <div className="task-list__empty-action">Click to add a task</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task._id} className="task-list__item">
          <Link to={`/tasks/${task._id}`} className="task-list__link">
            <div className="task-list__content">
              <h3 className="task-list__title">{task.name}</h3>
              {task.description && (
                <p className="task-list__description">{task.description}</p>
              )}
              <div className="task-list__meta">
                <span
                  className="task-list__priority"
                  data-priority={task.priority.toLowerCase()}
                >
                  {task.priority}
                </span>
                <span className="task-list__date">{task.dueDate}</span>
                <span className="task-list__progress">
                  {task.completionPercentage}%
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
