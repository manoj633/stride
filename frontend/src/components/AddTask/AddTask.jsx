// src/components/AddTask/AddTask.jsx
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toast } from "react-toastify";
import "./AddTask.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchGoals, fetchGoalById } from "../../store/features/goals/goalSlice";
import { createTask } from "../../store/features/tasks/taskSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import { useUnsavedChanges } from "../Common/useUnsavedChanges";

const AddTask = ({ goalId, onTaskAdded }) => {
  const [searchParams] = useSearchParams();
  const effectiveGoalId = goalId || searchParams.get("goalId") || "";

  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    priority: "Medium",
    startDate: "",
    endDate: "",
    goalId: effectiveGoalId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const goals = useAppSelector((state) => state.goals.items);
  const loading = useAppSelector((state) => state.goals.loading);
  const error = useAppSelector((state) => state.goals.error);

  const isDirty =
    !isSubmitting &&
    (Boolean(taskData.name?.trim()) ||
      Boolean(taskData.description?.trim()) ||
      Boolean(taskData.startDate) ||
      Boolean(taskData.endDate));

  useUnsavedChanges(isDirty, {
    title: "Discard New Task?",
    message:
      "You have entered details for a new task. If you leave this page, your progress will be lost.",
    confirmText: "Leave Page",
    cancelText: "Keep Editing",
  });

  useEffect(() => {
    if (effectiveGoalId && taskData.goalId !== effectiveGoalId) {
      setTaskData((prev) => ({ ...prev, goalId: effectiveGoalId }));
    }
  }, [effectiveGoalId]);

  const selectedGoal = goals.find((goal) => goal._id === taskData.goalId);
  const minStartDate = selectedGoal?.duration?.startDate
    ? new Date(selectedGoal.duration.startDate).toISOString().split("T")[0]
    : "";
  const maxEndDate = selectedGoal?.duration?.endDate
    ? new Date(selectedGoal.duration.endDate).toISOString().split("T")[0]
    : "";

  useEffect(() => {
    dispatch(fetchGoals({ year: "all" }));
  }, [dispatch]);

  // If a specific goal is targeted and not in cache, fetch it by ID
  useEffect(() => {
    if (effectiveGoalId && !goals.some((g) => g._id === effectiveGoalId)) {
      dispatch(fetchGoalById(effectiveGoalId));
    }
  }, [dispatch, effectiveGoalId, goals]);

  const handleGoalChange = (e) => {
    setTaskData({ ...taskData, goalId: e.target.value, startDate: "", endDate: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await toast.promise(dispatch(createTask(taskData)).unwrap(), {
        pending: "Creating your task...",
        success: "Task created successfully!",
        error: "Failed to create task",
      });
      if (onTaskAdded) {
        onTaskAdded();
      }
      if (taskData.goalId) {
        navigate(`/goals/${taskData.goalId}`);
      } else {
        navigate("/tasks");
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      setIsSubmitting(false);
    }
  };

  if (loading && goals.length === 0) return <LoadingSpinner message="Loading goals..." />;
  if (error && goals.length === 0) return <ErrorMessage message={error} />;

  return (
    <div className="add-task-container">
      {/* Top bar */}
      <div className="ef-topbar">
        <div className="ef-topbar__icon">T</div>
        <span className="ef-topbar__title">Tasks</span>
        <span className="ef-topbar__breadcrumb">
          / <span>New Task</span>
          {selectedGoal && ` (${selectedGoal.title})`}
        </span>
        <button
          className="ef-topbar__back"
          onClick={() => {
            if (taskData.goalId) {
              navigate(`/goals/${taskData.goalId}`);
            } else {
              navigate("/tasks");
            }
          }}
          type="button"
        >
          {taskData.goalId ? "← Back to Goal" : "← Back to Tasks"}
        </button>
      </div>

      {/* Scrollable body */}
      <div className="ef-body">
        <div className="add-task">
          {/* Card header */}
          <div className="ef-form-header">
            <h2>Create a new Task</h2>
            <p>Break your goal into actionable tasks with a clear timeline.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ef-form-body">
              <div className="form-group">
                <label htmlFor="name">Task Name</label>
                <input
                  type="text"
                  id="name"
                  value={taskData.name}
                  onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
                  placeholder="e.g. Prepare for Presentation"
                  required
                  aria-label="Task name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  placeholder="Describe what this task involves..."
                  aria-label="Task description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="goalId">Parent Goal</label>
                  <select
                    id="goalId"
                    value={taskData.goalId}
                    onChange={handleGoalChange}
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

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                    aria-label="Task priority"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={taskData.startDate}
                    min={minStartDate}
                    max={maxEndDate}
                    onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
                    required
                    disabled={!taskData.goalId}
                    aria-label="Task start date"
                  />
                  {!taskData.goalId && (
                    <span className="ef-hint">Select a goal first to set dates</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={taskData.endDate}
                    min={taskData.startDate || minStartDate}
                    max={maxEndDate}
                    onChange={(e) => setTaskData({ ...taskData, endDate: e.target.value })}
                    required
                    disabled={!taskData.startDate}
                    aria-label="Task end date"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="ef-submit-btn"
                disabled={isSubmitting}
                aria-label="Add new task"
              >
                {isSubmitting ? "Creating Task..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTask;
