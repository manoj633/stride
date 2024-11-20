import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchGoals } from "../../store/features/goals/goalSlice";
import {
  selectTasksByGoalId,
  fetchTasks,
} from "../../store/features/tasks/taskSlice";
import { createSubtask } from "../../store/features/subtasks/subtaskSlice";
import "./AddSubTask.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const formatDate = (isoDate) => {
  return new Date(isoDate).toISOString().split("T")[0];
};

const AddSubTask = ({ onSubtaskAdded }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    goalId: "",
    taskId: "",
  });

  // State for task date range
  const [taskDateRange, setTaskDateRange] = useState({
    minDate: "",
    maxDate: "",
  });

  // Fetch goals and tasks from Redux state
  const goals = useAppSelector((state) => state.goals.items);
  const availableTasks = useSelector((state) =>
    selectTasksByGoalId(state, formData.goalId)
  );

  // Fetch goals and tasks when the component loads
  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTasks());
  }, [dispatch]);

  // Handle goal selection change
  const handleGoalChange = (e) => {
    const selectedGoalId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      goalId: selectedGoalId,
      taskId: "", // Reset task selection when goal changes
    }));
    setTaskDateRange({ minDate: "", maxDate: "" }); // Reset date range
  };

  // Handle task selection change
  const handleTaskChange = (e) => {
    const selectedTaskId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      taskId: selectedTaskId,
    }));

    // Find the selected task to set the date range
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newSubtaskData = await dispatch(createSubtask(formData)).unwrap();
    onSubtaskAdded?.(newSubtaskData);
    resetForm();
    navigate(-1); // Navigate back
  };

  // Reset form state
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
    <div className="add-subtask">
      <h1 className="add-subtask__title">Add a Subtask</h1>
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
            min={taskDateRange.minDate}
            max={taskDateRange.maxDate}
            disabled={!formData.taskId}
          />
          {formData.taskId && !taskDateRange.minDate && (
            <p className="add-subtask__warning">
              Please select a task to enable the date range.
            </p>
          )}
        </div>

        <div className="add-subtask__form-group">
          <label className="add-subtask__label">Select Task</label>
          <select
            className="add-subtask__select"
            value={formData.taskId}
            onChange={handleTaskChange}
            required
            disabled={!formData.goalId}
          >
            <option value="">Choose a task</option>
            {availableTasks.map((task) => (
              <option key={task._id} value={task._id}>
                {task.name}
              </option>
            ))}
          </select>
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
              <option key={goal._id} value={goal._id}>
                {goal.title}
              </option>
            ))}
          </select>
        </div>

        {/* <div className="add-subtask__form-group">
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
              <option key={task._id} value={task._id}>
                {task.name}
              </option>
            ))}
          </select>
        </div> */}

        <button type="submit" className="add-subtask__submit-btn">
          Add Subtask
        </button>
      </form>
    </div>
  );
};

export default AddSubTask;
