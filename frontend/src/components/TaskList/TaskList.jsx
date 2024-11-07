// TaskList.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { tasksProvider } from "../../services/dataService";
import "./TaskList.css";

const TaskList = ({ tasks: propTasks }) => {
  // If tasks are passed as props (from GoalDescription), use those
  // Otherwise, fetch all tasks and filter for current month
  const navigate = useNavigate();
  const tasks =
    propTasks ||
    (() => {
      const allTasks = tasksProvider();
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

  // Component code
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
        <div key={task.id} className="task-list__item">
          <Link to={`/tasks/${task.id}`} className="task-list__link">
            <div className="task-list__content">
              <h3 className="task-list__title">{task.name}</h3>
              {task.description && (
                <p className="task-list__description">{task.description}</p>
              )}
              <div className="task-list__meta">
                <span className="task-list__priority">{task.priority}</span>
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
