// TaskSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const TaskSection = ({ tasks }) => {
  const navigate = useNavigate();

  return (
    <div className="goal-description__tasks">
      <h2 className="goal-description__subtitle">Tasks</h2>
      {tasks.length > 0 ? (
        <div className="embedded-task-list">
          {tasks.map((task) => (
            <div 
              key={task._id} 
              className="embedded-task-item"
              onClick={() => navigate(`/tasks/${task._id}`)}
            >
              <div className="embedded-task-header">
                <span className="embedded-task-title">{task.name}</span>
                <span className={`task__badge task__badge--priority-${(task.priority || 'Medium').toLowerCase()}`}>
                  {task.priority || "Medium"}
                </span>
              </div>
              <div className="embedded-task-progress">
                <div className="tk-progress">
                  <div className="tk-progress__track">
                    <div 
                      className="tk-progress__fill" 
                      style={{ 
                        width: `${task.completionPercentage}%`,
                        backgroundColor: task.completionPercentage === 100 ? "var(--ef-green, #16A34A)" : "var(--ef-accent)"
                      }} 
                    />
                  </div>
                  <span className="tk-progress__pct">{task.completionPercentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="goal-description__notice goal-description__notice--clickable"
          onClick={() => navigate("/tasks/add")}
        >
          <span className="goal-description__notice-text">
            No tasks available. Click here to add a task.
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskSection;

