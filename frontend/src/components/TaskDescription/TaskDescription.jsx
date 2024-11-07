import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tasksProvider, subtasksProvider } from "../../services/dataService";
import SubtaskList from "../SubtaskList/SubtaskList";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import "./TaskDescription.css";

const TaskDescription = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const tasks = tasksProvider();
  const task = tasks.find((t) => t.id === taskId);

  const subtasks = subtasksProvider().filter(
    (subtask) => subtask.taskId === taskId
  );

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

  const { id, name, description, dueDate, completionPercentage } = task;

  useEffect(() => {
    // Create chart
    const chart = am4core.create("task-chart", am4charts.PieChart3D);

    // Add data
    chart.data = [
      { category: "Completed", value: completionPercentage },
      { category: "Remaining", value: 100 - completionPercentage },
    ];

    // Create pie series
    const pieSeries = chart.series.push(new am4charts.PieSeries3D());
    pieSeries.dataFields.value = "value";
    pieSeries.dataFields.category = "category";

    // Set inner radius to create a donut effect
    pieSeries.innerRadius = am4core.percent(40); // Adjust the percentage for the thickness of the donut
    pieSeries.slices.template.cornerRadius = 10;
    pieSeries.slices.template.innerCornerRadius = 7;
    pieSeries.slices.template.draggable = false;

    pieSeries.colors.list = [
      am4core.color("#4caf50"), // Green for completed
      am4core.color("#f44336"), // Red for remaining
    ];

    // Add labels
    pieSeries.labels.template.text = "{category}: {value}%";
    pieSeries.ticks.template.disabled = true;

    // Clean up on unmount
    return () => {
      chart.dispose();
    };
  }, [completionPercentage]);

  return (
    <div className="task-description">
      <div className="task-description__container">
        <div className="task-description__header">
          <h1 className="task-description__title">
            <span className="task-description__id">{id}</span>
            {name}
          </h1>
          <div className="task-description__meta">
            <span className="task-description__date">{dueDate}</span>
            <span className="task-description__progress">
              {completionPercentage}% Complete
            </span>
            <span className={`priority-badge ${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
            <span
              className={`due-date-badge ${
                new Date(task.endDate) < new Date() ? "overdue" : ""
              }`}
            >
              Due: {new Date(task.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="task-description__content">
          <div className="task-description__info">
            <p className="task-description__text">{description}</p>
          </div>

          <div className="task-description__chart-wrapper">
            <div className="task-description__chart" id="task-chart"></div>
          </div>
        </div>

        <div className="task-description__subtasks">
          <h2 className="task-description__subtitle">Subtasks</h2>
          {subtasks.length > 0 ? (
            <SubtaskList subtasks={subtasks} />
          ) : (
            <div
              className="task-description__notice task-description__notice--clickable"
              onClick={() => navigate("/subtasks/add")}
            >
              <span className="task-description__notice-text">
                No subtasks available for this task. Click here to add a
                subtask.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDescription;
