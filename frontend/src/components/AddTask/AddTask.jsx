// src/components/AddTask/AddTask.jsx
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toast } from "react-toastify";

import "./AddTask.css";
import { useNavigate } from "react-router-dom";
import { fetchGoals } from "../../store/features/goals/goalSlice";
import { createTask } from "../../store/features/tasks/taskSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

const AddTask = ({ goalId, onTaskAdded }) => {
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    priority: "Medium",
    startDate: "",
    endDate: "",
    goalId: goalId || "",
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state) => state.goals.items);
  const loading = useAppSelector((state) => state.goals.loading);
  const error = useAppSelector((state) => state.goals.error);

  const selectedGoal = goals.find((goal) => goal._id === taskData.goalId);
  const minStartDate = selectedGoal
    ? new Date(selectedGoal.duration.startDate).toISOString().split("T")[0]
    : "";
  const maxEndDate = selectedGoal
    ? new Date(selectedGoal.duration.endDate).toISOString().split("T")[0]
    : "";

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleGoalChange = (e) => {
    const newGoalId = e.target.value;
    const selectedGoal = goals.find((goal) => goal._id === newGoalId);

    setTaskData({
      ...taskData,
      goalId: newGoalId,
      startDate: "",
      endDate: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTask = {
      ...taskData,
      completed: false,
      completionPercentage: 0,
    };

    try {
      toast.promise(dispatch(createTask(taskData)).unwrap(), {
        pending: "Creating your task... ⏳",
        success: "Task created successfully! 🚀",
        error: "Failed to create task 😭",
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    }

    navigate(-1);
  };

  if (loading) return <LoadingSpinner message="Loading tags..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="add-task-container">
      <div className="add-task">
        <h1>🚀 Add New Task</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Task Name:</label>
            <input
              type="text"
              id="name"
              value={taskData.name}
              onChange={(e) =>
                setTaskData({ ...taskData, name: e.target.value })
              }
              placeholder="Ex: Prepare for Presentation"
              className="add-task__input"
              required
              aria-label="Task name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={taskData.description}
              onChange={(e) =>
                setTaskData({ ...taskData, description: e.target.value })
              }
              placeholder="Tell us more about your task..."
              className="add-task__input add-task__textarea"
              aria-label="Task description"
            />
          </div>
          <div className="form-group">
            <label htmlFor="goalId">Goal:</label>
            <select
              id="goalId"
              value={taskData.goalId}
              onChange={handleGoalChange}
              className="add-task__select"
              required
              aria-label="Goal for task"
            >
              <option value="">Select a Goal</option>
              {goals.map((goal) => (
                <option key={goal._id} value={goal._id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority:</label>
              <select
                id="priority"
                value={taskData.priority}
                onChange={(e) =>
                  setTaskData({ ...taskData, priority: e.target.value })
                }
                className="add-task__select"
                aria-label="Task priority"
              >
                <option value="High">🔥 High</option>
                <option value="Medium">💧 Medium</option>
                <option value="Low">🍃 Low</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={taskData.startDate}
                min={minStartDate}
                max={maxEndDate}
                onChange={(e) =>
                  setTaskData({ ...taskData, startDate: e.target.value })
                }
                className="add-task__date"
                required
                disabled={!taskData.goalId}
                aria-label="Task start date"
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={taskData.endDate}
                min={taskData.startDate || minStartDate}
                max={maxEndDate}
                onChange={(e) =>
                  setTaskData({ ...taskData, endDate: e.target.value })
                }
                className="add-task__date"
                required
                disabled={!taskData.startDate}
                aria-label="Task end date"
              />
            </div>
          </div>
          <button
            type="submit"
            className="add-task__button"
            aria-label="Add new task"
          >
            🚀 Add Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
