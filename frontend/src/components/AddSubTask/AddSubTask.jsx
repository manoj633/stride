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
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
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
  const { loading, error } = useAppSelector((state) => state.subtasks);

  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleGoalChange = (e) => {
    setFormData((prev) => ({ ...prev, goalId: e.target.value, taskId: "" }));
    setTaskDateRange({ minDate: "", maxDate: "" });
  };

  const handleTaskChange = (e) => {
    const selectedTaskId = e.target.value;
    setFormData((prev) => ({ ...prev, taskId: selectedTaskId }));

    const selectedTask = availableTasks.find((task) => task._id === selectedTaskId);
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
          pending: "Creating your subtask...",
          success: "Subtask created successfully!",
          error: "Failed to create subtask",
        }
      );
      onSubtaskAdded?.(newSubtaskData);
      setFormData({ name: "", description: "", priority: "Medium", dueDate: "", goalId: "", taskId: "" });
      setTaskDateRange({ minDate: "", maxDate: "" });
      navigate("/subtasks");
    } catch (error) {
      console.error("Failed to create subtask:", error);
      navigate("/subtasks");
    }
  };

  if (loading) return <LoadingSpinner message="Loading subtasks..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="add-subtask-container">
      {/* Top bar */}
      <div className="ef-topbar">
        <div className="ef-topbar__icon">S</div>
        <span className="ef-topbar__title">Subtasks</span>
        <span className="ef-topbar__breadcrumb">
          / <span>New Subtask</span>
        </span>
        <button
          className="ef-topbar__back"
          onClick={() => navigate("/subtasks")}
          type="button"
        >
          ← Back to Subtasks
        </button>
      </div>

      {/* Scrollable body */}
      <div className="ef-body">
        <div className="add-subtask">
          {/* Card header */}
          <div className="ef-form-header">
            <h2>Create a new Subtask</h2>
            <p>Assign a specific action item to a task and set a due date.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ef-form-body">
              <div className="form-group">
                <label htmlFor="name">Subtask Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Research Topic"
                  required
                  aria-label="Subtask name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does completing this subtask involve?"
                  aria-label="Subtask description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="goalId">Parent Goal</label>
                  <select
                    id="goalId"
                    value={formData.goalId}
                    onChange={handleGoalChange}
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
                  <label htmlFor="taskId">Parent Task</label>
                  <select
                    id="taskId"
                    value={formData.taskId}
                    onChange={handleTaskChange}
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
                  {!formData.goalId && (
                    <span className="ef-hint">Select a goal first</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    aria-label="Subtask priority"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dueDate">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    min={taskDateRange.minDate}
                    max={taskDateRange.maxDate}
                    disabled={!formData.taskId}
                    aria-label="Subtask due date"
                  />
                  {!formData.taskId && (
                    <span className="ef-hint">Select a task to enable date picker</span>
                  )}
                </div>
              </div>

              <button type="submit" className="ef-submit-btn" aria-label="Add new subtask">
                Create Subtask
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSubTask;
