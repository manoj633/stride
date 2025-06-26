// TaskList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchTasks } from "../../store/features/tasks/taskSlice";
import { fetchTags } from "../../store/features/tags/tagSlice";
import { getUsers } from "../../store/features/users/userSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import TaskSearchAndFilters from "./TaskSearchAndFilters";
import "./TaskList.css";
import { toast } from "react-toastify";

const TaskList = ({ tasks: propTasks }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allTasks = useSelector((state) => state.tasks.items);
  const loading = useSelector((state) => state.tasks.loading);
  const error = useSelector((state) => state.tasks.error);
  const tags = useSelector((state) => state.tags.items);
  const users = useSelector((state) => state.user.users);

  // Filter/search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterCollaborator, setFilterCollaborator] = useState("");
  // Set default date range to today
  const todayStr = new Date().toISOString().split("T")[0];
  const [filterDateRange, setFilterDateRange] = useState({
    start: todayStr,
    end: todayStr,
  });

  useEffect(() => {
    if (!propTasks && allTasks.length === 0) {
      dispatch(fetchTasks())
        .unwrap()
        .catch((error) => {
          console.error("Failed to fetch tasks:", error);
          toast.error("Failed to fetch tasks");
        });
    }
  }, [dispatch, propTasks, allTasks.length]);

  useEffect(() => {
    if (error === "Request failed with status code 401") {
      navigate("/login");
    }
  }, [error, navigate]);

  useEffect(() => {
    dispatch(fetchTags());
    dispatch(getUsers());
  }, [dispatch]);

  const tasks = useMemo(() => {
    let filtered = propTasks || allTasks;
    // Tag filter
    if (filterTag) {
      filtered = filtered.filter((task) =>
        (task.tags || []).includes(filterTag)
      );
    }
    // Collaborator filter
    if (filterCollaborator) {
      filtered = filtered.filter((task) =>
        (task.collaborators || []).includes(filterCollaborator)
      );
    }
    // Date range filter
    if (filterDateRange.start) {
      filtered = filtered.filter(
        (task) => new Date(task.startDate) >= new Date(filterDateRange.start)
      );
    }
    if (filterDateRange.end) {
      filtered = filtered.filter(
        (task) => new Date(task.endDate) <= new Date(filterDateRange.end)
      );
    }
    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          (task.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [
    propTasks,
    allTasks,
    filterTag,
    filterCollaborator,
    filterDateRange,
    searchTerm,
  ]);

  if (loading) return <LoadingSpinner message="Loading tasks..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="task-list">
      <TaskSearchAndFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        filterCollaborator={filterCollaborator}
        setFilterCollaborator={setFilterCollaborator}
        filterDateRange={filterDateRange}
        setFilterDateRange={setFilterDateRange}
        availableTags={tags}
        availableCollaborators={users}
      />
      {tasks.length === 0 ? (
        <div
          className="task-list__empty"
          onClick={() => navigate("/tasks/add")}
          role="button"
          tabIndex={0}
          aria-label="Add your first task"
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/tasks/add");
          }}
        >
          <p className="task-list__empty-text">
            No tasks yet! ✨ Time to get productive! 🚀
          </p>
          <p className="task-list__empty-action">
            Click here to add your first task! ➕
          </p>
        </div>
      ) : (
        tasks.map((task) => (
          <Link
            key={task._id}
            to={`/tasks/${task._id}`}
            className="task-list__item-link"
            aria-label={`View details for task: ${task.name}${
              task.priority === "High" ? ", high priority" : ""
            }`}
          >
            <div className="task-list__item">
              <div className="task-list__content">
                <h3 className="task-list__title">
                  {task.name}
                  {task.priority === "High" && <span> 🔥</span>}
                </h3>
                {task.description && (
                  <p className="task-list__description">{task.description}</p>
                )}
              </div>
              <div className="task-list__meta">
                <span
                  className={`task-list__priority ${
                    task.priority.toLowerCase() === "high"
                      ? "high"
                      : task.priority.toLowerCase() === "medium"
                      ? "medium"
                      : "low"
                  }`}
                  aria-label={`Priority: ${task.priority}`}
                >
                  {task.priority}
                </span>
                <span
                  className="task-list__date"
                  aria-label={`Due date: ${task.dueDate}`}
                >
                  {task.dueDate}
                </span>
                <div className="task-list__progress-container">
                  <span
                    className="task-list__progress-label"
                    aria-label={`Completion: ${task.completionPercentage}%`}
                  >
                    {task.completionPercentage}%
                  </span>
                  <div className="task-list__progress-bar">
                    <div
                      className="task-list__progress-bar-fill"
                      style={{
                        width: `${task.completionPercentage}%`,
                        backgroundColor:
                          task.completionPercentage === 100
                            ? "#4ade80"
                            : task.priority.toLowerCase() === "high"
                            ? "#f87171"
                            : task.priority.toLowerCase() === "medium"
                            ? "#fbb6ce"
                            : "#cbd5e1",
                      }}
                      aria-label={`Progress bar: ${task.completionPercentage}% complete`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default TaskList;
