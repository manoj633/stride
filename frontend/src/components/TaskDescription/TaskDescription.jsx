import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { toast } from "react-toastify";

import SubtaskList from "../SubtaskList/SubtaskList";
import { fetchTasks, deleteTask } from "../../store/features/tasks/taskSlice";
import { fetchSubtasks } from "../../store/features/subtasks/subtaskSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

import "./TaskDescription.css";

const TaskDescription = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const task = useSelector((state) =>
    state.tasks.items.find((t) => t._id === taskId)
  );
  const subtasks = useSelector((state) =>
    state.subtasks.items.filter((subtask) => subtask.taskId === taskId)
  );
  const loading = useSelector(
    (state) => state.tasks.loading || state.subtasks.loading
  );
  const error = useSelector(
    (state) => state.tasks.error || state.subtasks.error
  );

  useEffect(() => {
    if (!task) {
      dispatch(fetchTasks());
    }
    if (subtasks.length === 0) {
      dispatch(fetchSubtasks());
    }
  }, [dispatch, task, subtasks.length]);

  useEffect(() => {
    if (!task) return;
    const chart = am4core.create("task-chart", am4charts.PieChart3D);
    chart.data = [
      { category: "Completed", value: task.completionPercentage },
      { category: "Remaining", value: 100 - task.completionPercentage },
    ];

    const pieSeries = chart.series.push(new am4charts.PieSeries3D());
    pieSeries.dataFields.value = "value";
    pieSeries.dataFields.category = "category";
    pieSeries.innerRadius = am4core.percent(40);
    pieSeries.slices.template.cornerRadius = 10;
    pieSeries.slices.template.innerCornerRadius = 7;
    pieSeries.slices.template.draggable = false;

    // Use Enterprise colors
    pieSeries.colors.list = [
      am4core.color("#2563EB"), // Completed - Accent Blue
      am4core.color("#E4E4E7"), // Remaining - Border color
    ];

    pieSeries.labels.template.text = "{category}: {value}%";
    pieSeries.ticks.template.disabled = true;

    // Remove logo watermark
    if (chart.logo) {
      chart.logo.disabled = true;
    }

    return () => {
      chart.dispose();
    };
  }, [task]);

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await toast.promise(dispatch(deleteTask(task._id)).unwrap(), {
          pending: "Deleting task...",
          success: "Task deleted successfully!",
          error: "Failed to delete task",
        });
        navigate("/tasks");
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading task details..." />;
  if (error) return <ErrorMessage message={error} />;

  if (!task) {
    return (
      <div className="task-empty">
        <div className="task-empty__message">
          <span className="task-empty__icon">🔍</span>
          <h3 className="task-empty__text">Task not found</h3>
        </div>
      </div>
    );
  }

  const { _id, name, description, endDate, completionPercentage, priority } = task;

  return (
    <div className="task-container">
      {/* Top bar */}
      <div className="ef-topbar">
        <div className="ef-topbar__icon">T</div>
        <span className="ef-topbar__title">Task Details</span>
        <span className="ef-topbar__breadcrumb">
          / <span>{name}</span>
        </span>
        <div className="ef-topbar__actions">
          <button
            className="ef-btn-danger"
            onClick={handleDeleteTask}
            title="Delete Task"
          >
            Delete
          </button>
          <button
            className="ef-btn-ghost"
            onClick={() => navigate("/tasks")}
            type="button"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="ef-body">
        <div className="task-layout">
          {/* Main Card */}
          <div className="task-card">
            <div className="task-card__header">
              <div className="task__header-top">
                <div className="task__badges">
                  <span className={`task__badge task__badge--priority-${(priority || 'Medium').toLowerCase()}`}>
                    {priority || 'Medium'} Priority
                  </span>
                  {endDate && (
                    <span className="task__badge task__badge--date">
                      Due: {new Date(endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <h2>{name}</h2>
            </div>

            <div className="task-card__body">
              {/* Left Column: Description */}
              <div className="task__info-left">
                <div className="task__info-item">
                  <span className="task__info-label">Description</span>
                  <p className="task__info-value--description">
                    {description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Right Column: Chart */}
              <div className="task__info-right">
                <div className="task__chart-wrapper">
                  <span className="task__chart-title">Progress: {completionPercentage}%</span>
                  <div className="task__chart" id="task-chart"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="task-subtasks-section">
            <h3>Subtasks</h3>
            {subtasks.length > 0 ? (
              <div className="embedded-subtask-list">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask._id}
                    className={`embedded-subtask-item ${subtask.completed ? "completed" : ""}`}
                    onClick={() => navigate(`/subtasks/${subtask._id}`)}
                  >
                    <div className="embedded-subtask-header">
                      <div className="embedded-subtask-title-wrap">
                        <span className="embedded-subtask-checkbox">
                          {subtask.completed ? "✓" : "○"}
                        </span>
                        <span className="embedded-subtask-title">{subtask.name}</span>
                      </div>
                      <span className={`task__badge task__badge--priority-${(subtask.priority || 'Medium').toLowerCase()}`}>
                        {subtask.priority || "Medium"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="task__notice"
                onClick={() => navigate("/subtasks/add")}
              >
                No subtasks available. Click here to add one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDescription;
