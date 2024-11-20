// src/components/AddTask/AddTask.jsx
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

import "./AddTask.css";
import { useNavigate } from "react-router-dom";
import { fetchGoals } from "../../store/features/goals/goalSlice";
import { createTask } from "../../store/features/tasks/taskSlice";

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
      await dispatch(createTask(taskData)).unwrap();
    } catch (error) {
      console.error("Failed to create task:", error);
    }

    navigate(-1);
  };

  if (loading) return <div>Loading ...</div>;

  return (
    <div className="add-task">
      <h1 className="add-task__title">Add a Task</h1>
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
          onChange={handleGoalChange}
          className="add-task__select"
          required
        >
          <option value="">Select a Goal</option>
          {goals.map((goal) => (
            <option key={goal._id} value={goal._id}>
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
            min={minStartDate}
            max={maxEndDate}
            onChange={(e) =>
              setTaskData({ ...taskData, startDate: e.target.value })
            }
            className="add-task__date"
            required
            disabled={!taskData.goalId}
          />
          <input
            type="date"
            value={taskData.endDate}
            min={taskData.startDate || minStartDate}
            max={maxEndDate}
            onChange={(e) =>
              setTaskData({ ...taskData, endDate: e.target.value })
            }
            className="add-task__date"
            required
            disabled={!taskData.startDate}
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
