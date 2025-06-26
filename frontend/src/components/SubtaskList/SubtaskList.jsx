// SubtaskList/SubtaskList.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchSubtasks } from "../../store/features/subtasks/subtaskSlice";
import { fetchTags } from "../../store/features/tags/tagSlice";
import { getUsers } from "../../store/features/users/userSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import { toast } from "react-toastify";
import SubtaskSearchAndFilters from "./SubtaskSearchAndFilters";
import "./SubtaskList.css";

const SubtaskList = ({ subtasks: propSubtasks }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allSubtasks = useSelector((state) => state.subtasks.items);
  const loading = useSelector((state) => state.subtasks.loading);
  const error = useSelector((state) => state.subtasks.error);
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
    if (!propSubtasks && allSubtasks.length === 0) {
      dispatch(fetchSubtasks())
        .unwrap()
        .catch((error) => {
          console.error("Failed to fetch subtasks:", error);
          toast.error("Failed to fetch subtasks");
        });
    }
  }, [dispatch, propSubtasks, allSubtasks.length]);

  useEffect(() => {
    if (error === "Request failed with status code 401") {
      navigate("/login");
    }
  }, [error, navigate]);

  useEffect(() => {
    dispatch(fetchTags());
    dispatch(getUsers());
  }, [dispatch]);

  const subtasks = useMemo(() => {
    let filtered = propSubtasks || allSubtasks;
    // Tag filter
    if (filterTag) {
      filtered = filtered.filter((subtask) =>
        (subtask.tags || []).includes(filterTag)
      );
    }
    // Collaborator filter
    if (filterCollaborator) {
      filtered = filtered.filter((subtask) =>
        (subtask.collaborators || []).includes(filterCollaborator)
      );
    }
    // Date range filter
    if (filterDateRange.start) {
      filtered = filtered.filter(
        (subtask) =>
          new Date(subtask.dueDate) >= new Date(filterDateRange.start)
      );
    }
    if (filterDateRange.end) {
      filtered = filtered.filter(
        (subtask) => new Date(subtask.dueDate) <= new Date(filterDateRange.end)
      );
    }
    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (subtask) =>
          (subtask.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (subtask.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [
    propSubtasks,
    allSubtasks,
    filterTag,
    filterCollaborator,
    filterDateRange,
    searchTerm,
  ]);

  if (loading) return <LoadingSpinner message="Loading subtasks..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="subtask-list">
      <SubtaskSearchAndFilters
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
      {subtasks.length === 0 ? (
        <div
          className="subtask-list__empty"
          onClick={() => navigate("/tasks/add")}
          role="button"
          tabIndex={0}
          aria-label="Add your first task"
        >
          <p className="subtask-list__empty-text">
            No subtasks yet! ✨ Time to get productive! 🚀
          </p>
          <p className="subtask-list__empty-action">
            Click here to add your first task! ➕
          </p>
        </div>
      ) : (
        subtasks.map((subtask) => (
          <Link
            key={subtask._id}
            to={`/subtasks/${subtask._id}`}
            className="subtask-list__item-link"
            aria-label={`View details for subtask ${subtask.name}`}
          >
            <div
              className={`subtask-list__item ${
                subtask.completed ? "subtask-list__item--completed" : ""
              }`}
            >
              <div className="subtask-list__content">
                <h3 className="subtask-list__title">
                  {subtask.name}
                  {subtask.priority === "High" && <span> 🔥</span>}
                </h3>
                {subtask.description && (
                  <p className="subtask-list__description">
                    {subtask.description}
                  </p>
                )}
              </div>
              <div className="subtask-list__meta">
                <span
                  className={`subtask-list__status ${
                    subtask.completed ? "completed" : "pending"
                  }`}
                >
                  {subtask.completed ? "Completed" : "Pending"}
                </span>
                {subtask.dueDate && (
                  <span className="subtask-list__date">
                    {new Date(subtask.dueDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default SubtaskList;
