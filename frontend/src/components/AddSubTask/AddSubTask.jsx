import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchGoals } from "../../store/features/goals/goalSlice";
import {
  selectTasksByGoalId,
  fetchTasks,
} from "../../store/features/tasks/taskSlice";
import { createSubtask } from "../../store/features/subtasks/subtaskSlice";
import "./AddSubTask.css";

const formatDate = (isoDate) => {
  return new Date(isoDate).toISOString().split("T")[0];
};

const AddSubTask = ({ onSubtaskAdded }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    goalId: "",
    taskId: "",
  });

  const [taskDateRange, setTaskDateRange] = useState({
    minDate: "",
    maxDate: "",
  });

  const goals = useAppSelector((state) => state.goals.items);
  const availableTasks = useAppSelector((state) =>
    selectTasksByGoalId(state, formData.goalId)
  );

  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleGoalChange = (e) => {
    const selectedGoalId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      goalId: selectedGoalId,
      taskId: "",
    }));
    setTaskDateRange({ minDate: "", maxDate: "" });
  };

  const handleTaskChange = (e) => {
    const selectedTaskId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      taskId: selectedTaskId,
    }));

    const selectedTask = availableTasks.find(
      (task) => task._id === selectedTaskId
    );
    if (selectedTask) {
      setTaskDateRange({
        minDate: formatDate(selectedTask.startDate),
        maxDate: formatDate(selectedTask.endDate),
      });
    } else {
      setTaskDateRange({ minDate: "", maxDate: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newSubtaskData = await toast.promise(
        dispatch(createSubtask(formData)).unwrap(),
        {
          pending: "Creating your subtask... ⏳",
          success: "Subtask created successfully! 🚀",
          error: "Failed to create subtask 😭",
        }
      );

      onSubtaskAdded?.(newSubtaskData);
      resetForm();
      navigate(-1);
    } catch (error) {
      console.error("Failed to create subtask:", error);
    }
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
    setTaskDateRange({ minDate: "", maxDate: "" });
  };

  return (
    <div className="add-subtask-container">
      <div className="add-subtask">
        <h1>🚀 Add New Subtask</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Subtask Name:</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Research Topic"
              className="add-subtask__input"
              required
              aria-label="Subtask name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tell us more about your subtask..."
              className="add-subtask__input add-subtask__textarea"
              aria-label="Subtask description"
            />
          </div>
          <div className="form-group">
            <label htmlFor="priority">Priority:</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="add-subtask__select"
              aria-label="Subtask priority"
            >
              <option value="High">🔥 High</option>
              <option value="Medium">💧 Medium</option>
              <option value="Low">🍃 Low</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="goalId">Goal:</label>
            <select
              id="goalId"
              value={formData.goalId}
              onChange={handleGoalChange}
              className="add-subtask__select"
              required
              aria-label="Goal for subtask"
            >
              <option value="">Select a Goal</option>
              {goals.map((goal) => (
                <option key={goal._id} value={goal._id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="taskId">Task:</label>
            <select
              id="taskId"
              value={formData.taskId}
              onChange={handleTaskChange}
              className="add-subtask__select"
              required
              disabled={!formData.goalId}
              aria-label="Task for subtask"
            >
              <option value="">Select a Task</option>
              {availableTasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Due Date:</label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="add-subtask__date"
              required
              min={taskDateRange.minDate}
              max={taskDateRange.maxDate}
              disabled={!formData.taskId}
              aria-label="Subtask due date"
            />
            {formData.taskId && !taskDateRange.minDate && (
              <p className="add-subtask__warning">
                Please select a task to enable the date range.
              </p>
            )}
          </div>
          <button
            type="submit"
            className="add-subtask__button"
            aria-label="Add new subtask"
          >
            🚀 Add Subtask
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubTask;
