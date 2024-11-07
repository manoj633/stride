// src/components/AddTask/AddTask.jsx
import React, { useState } from "react";
import { addTask, goalsProvider } from "../../services/dataService";
import "./AddTask.css";
import { useNavigate } from "react-router-dom";

const AddTask = ({ goalId, onTaskAdded }) => {
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    priority: "Medium",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    goalId: goalId || "",
  });
  const navigate = useNavigate();
  const goals = goalsProvider(); // Get all goals
  const handleSubmit = (e) => {
    e.preventDefault();
    const newTask = addTask(taskData);
    if (onTaskAdded) onTaskAdded(newTask);
    setTaskData({
      name: "",
      description: "",
      priority: "Medium",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      goalId: goalId || "",
    });

    navigate(-1);
  };

  return (
    <div className="add-task">
      <h1 class="add-task__title">Add a Task</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={taskData.name}
          onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
          placeholder="Task name"
          className="add-task__input"
          required
        />

        <textarea
          value={taskData.description}
          onChange={(e) =>
            setTaskData({ ...taskData, description: e.target.value })
          }
          placeholder="Description"
          className="add-task__input add-task__textarea"
        />
        <select
          value={taskData.goalId}
          onChange={(e) => setTaskData({ ...taskData, goalId: e.target.value })}
          className="add-task__select"
          required
        >
          <option value="">Select a Goal</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>

        <select
          value={taskData.priority}
          onChange={(e) =>
            setTaskData({ ...taskData, priority: e.target.value })
          }
          className="add-task__select"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <div className="add-task__date-group">
          <input
            type="date"
            value={taskData.startDate}
            onChange={(e) =>
              setTaskData({ ...taskData, startDate: e.target.value })
            }
            className="add-task__date"
            required
          />
          <input
            type="date"
            value={taskData.endDate}
            onChange={(e) =>
              setTaskData({ ...taskData, endDate: e.target.value })
            }
            className="add-task__date"
            required
          />
        </div>

        <button type="submit" className="add-task__button">
          Add Task
        </button>
      </form>
    </div>
  );
};

export default AddTask;
