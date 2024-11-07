// src/components/AddSubTask/AddSubTask.jsx
import React, { useState, useEffect } from "react";
import {
  goalsProvider,
  getTasksByGoalId,
  addSubtask,
} from "../../services/dataService";
import "./AddSubTask.css";
import { useNavigate } from "react-router-dom";

const AddSubTask = ({ onSubtaskAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    goalId: "",
    taskId: "",
  });

  const [goals, setGoals] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    setGoals(goalsProvider());
  }, []);

  const handleGoalChange = (e) => {
    const selectedGoalId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      goalId: selectedGoalId,
      taskId: "", // Reset task selection when goal changes
    }));
    setAvailableTasks(getTasksByGoalId(selectedGoalId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSubtask = addSubtask(formData);
    onSubtaskAdded?.(newSubtask);
    resetForm();
    navigate(-1);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      priority: "Medium",
      dueDate: "",
      goalId: "",
      taskId: "",
    });
    setAvailableTasks([]);
  };

  return (
    <div className="add-subtask">
      <h1 class="add-subtask__title">Add a Subtask</h1>
      <form className="add-subtask__form" onSubmit={handleSubmit}>
        <div className="add-subtask__form-group">
          <label className="add-subtask__label">Name</label>
          <input
            type="text"
            className="add-subtask__input"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div className="add-subtask__form-group">
          <label className="add-subtask__label">Description</label>
          <textarea
            className="add-subtask__textarea"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        <div className="add-subtask__form-group">
          <label className="add-subtask__label">Priority</label>
          <select
            className="add-subtask__select"
            value={formData.priority}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, priority: e.target.value }))
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="add-subtask__form-group">
          <label className="add-subtask__label">Due Date</label>
          <input
            type="date"
            className="add-subtask__input"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
            }
            required
          />
        </div>

        <div className="add-subtask__form-group">
          <label className="add-subtask__label">Select Goal</label>
          <select
            className="add-subtask__select"
            value={formData.goalId}
            onChange={handleGoalChange}
            required
          >
            <option value="">Choose a goal</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </div>

        <div className="add-subtask__form-group">
          <label className="add-subtask__label">Select Task</label>
          <select
            className="add-subtask__select"
            value={formData.taskId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, taskId: e.target.value }))
            }
            required
            disabled={!formData.goalId}
          >
            <option value="">Choose a task</option>
            {availableTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="add-subtask__submit-btn">
          Add Subtask
        </button>
      </form>
    </div>
  );
};

export default AddSubTask;
