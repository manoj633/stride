import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import SubtaskList from "../SubtaskList/SubtaskList";
import { fetchTasks, deleteTask } from "../../store/features/tasks/taskSlice";
import { fetchSubtasks } from "../../store/features/subtasks/subtaskSlice";

import "./TaskDescription.css";

const TaskDescription = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
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

  // Fetch data
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchSubtasks());
  }, [dispatch]);

  // Chart effect
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

    pieSeries.colors.list = [
      am4core.color("#4caf50"),
      am4core.color("#f44336"),
    ];

    pieSeries.labels.template.text = "{category}: {value}%";
    pieSeries.ticks.template.disabled = true;

    return () => {
      chart.dispose();
    };
  }, [task]);

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await dispatch(deleteTask(_id));
        navigate("/tasks"); // Redirect to tasks list after deletion
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  // Render loading state
  if (loading) {
    return <div className="task-description">Loading...</div>;
  }

  // Render error state
  if (error) {
    return <div className="task-description">Error: {error}</div>;
  }

  // Render not found state
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

  const { _id, name, description, endDate, completionPercentage, priority } =
    task;

  return (
    <div className="task-description">
      <div className="task-description__container">
        <div className="task-description__header">
          <h1 className="task-description__title">
            <span className="task-description__id">{_id}</span>
            {name}
          </h1>
          <div className="task-description__meta">
            <span className="task-description__progress">
              {completionPercentage}% Complete
            </span>
            <span className={`priority-badge ${priority.toLowerCase()}`}>
              {priority}
            </span>
            <span
              className={`due-date-badge ${
                new Date(endDate) < new Date() ? "overdue" : ""
              }`}
            >
              Due: {new Date(endDate).toLocaleDateString()}
            </span>
          </div>
          <button
            className="task-description__delete-btn"
            onClick={handleDeleteTask}
          >
            Delete Task
          </button>
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
