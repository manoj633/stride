// TaskSection.jsx
import React from "react";
import TaskList from "../TaskList/TaskList";
import { useNavigate } from "react-router-dom";

const TaskSection = ({ tasks }) => {
  const navigate = useNavigate();
  return (
    <div className="goal-description__tasks">
      <h2 className="goal-description__subtitle">Tasks</h2>
      {tasks.length > 0 ? (
        <TaskList tasks={tasks} />
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
