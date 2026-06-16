// SubtaskDescription/SubtaskDescription.jsx
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import {
  fetchSubtaskById,
  updateSubtask,
  deleteSubtask,
} from "../../store/features/subtasks/subtaskSlice";
import "./SubtaskDescription.css";
import { updateTaskCompletion } from "../../store/features/tasks/taskSlice";
import { updateGoalCompletion } from "../../store/features/goals/goalSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

const SubtaskDescription = () => {
  const { subtaskId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const allSubtasks = useSelector((state) => state.subtasks.items);

  const subtask = useSelector((state) =>
    state.subtasks.items.find((st) => st._id === subtaskId)
  );
  const loading = useSelector((state) => state.subtasks.loading);
  const error = useSelector((state) => state.subtasks.error);

  useEffect(() => {
    if (!subtask) {
      dispatch(fetchSubtaskById(subtaskId));
    }
  }, [dispatch, subtaskId, subtask]);

  const handleCheckboxChange = () => {
    const updatedSubtask = {
      ...subtask,
      completed: !subtask.completed,
    };

    toast.promise(
      (async () => {
        await dispatch(
          updateSubtask({ id: subtaskId, subtaskData: updatedSubtask })
        );
        if (subtask.taskId) {
          await dispatch(
            updateTaskCompletion({
              taskId: subtask.taskId,
              subtasks: allSubtasks,
            })
          );
          if (subtask.goalId) {
            await dispatch(
              updateGoalCompletion({
                goalId: subtask.goalId,
                subtasks: allSubtasks,
              })
            );
          }
        }
      })(),
      {
        pending: "Updating subtask...",
        success: "Subtask updated successfully!",
        error: "Failed to update subtask",
      }
    ).finally(() => {
      // Don't navigate back on simple toggle, just let the user see it's done
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this subtask?")) {
      toast.promise(
        (async () => {
          await dispatch(deleteSubtask(subtaskId));
          if (subtask.taskId) {
            await dispatch(
              updateTaskCompletion({
                taskId: subtask.taskId,
                subtasks: allSubtasks.filter((st) => st._id !== subtaskId),
              })
            );
            if (subtask.goalId) {
              await dispatch(
                updateGoalCompletion({
                  goalId: subtask.goalId,
                  subtasks: allSubtasks.filter((st) => st._id !== subtaskId),
                })
              );
            }
          }
        })(),
        {
          pending: "Deleting subtask...",
          success: "Subtask deleted successfully!",
          error: "Failed to delete subtask",
        }
      ).finally(() => {
        navigate("/subtasks");
      });
    }
  };

  if (loading) return <LoadingSpinner message="Loading subtask details..." />;
  if (error) return <ErrorMessage message={error} />;

  if (!subtask) {
    return (
      <div className="subtask-empty">
        <div className="subtask-empty__message">
          <span className="subtask-empty__icon">🔍</span>
          <h3 className="subtask-empty__text">Subtask not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="subtask-container">
      {/* Top bar */}
      <div className="ef-topbar">
        <div className="ef-topbar__icon">S</div>
        <span className="ef-topbar__title">Subtask Details</span>
        <span className="ef-topbar__breadcrumb">
          / <span>{subtask.name}</span>
        </span>
        <div className="ef-topbar__actions">
          <button
            className="ef-btn-danger"
            onClick={handleDelete}
            title="Delete Subtask"
          >
            Delete
          </button>
          <button
            className="ef-btn-ghost"
            onClick={() => navigate("/subtasks")}
            type="button"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="ef-body">
        <div className="subtask-card">
          <div className="subtask-card__header">
            <div className="subtask__status">
              <input
                type="checkbox"
                className="subtask__checkbox"
                checked={subtask.completed}
                onChange={handleCheckboxChange}
                id="subtask-status"
                aria-label={
                  subtask.completed
                    ? "Mark subtask as incomplete"
                    : "Mark subtask as complete"
                }
              />
              <label htmlFor="subtask-status" className="subtask__status-label">
                {subtask.completed ? "Completed" : "Mark as complete"}
              </label>
            </div>
            <h2>{subtask.name}</h2>
          </div>

          <div className="subtask-card__body">
            <div className="subtask__info-grid">
              <div className="subtask__info-item">
                <span className="subtask__info-label">Due Date</span>
                <span className="subtask__info-value">
                  {subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString() : "No Date"}
                </span>
              </div>
              <div className="subtask__info-item">
                <span className="subtask__info-label">Priority</span>
                <span className="subtask__info-value">{subtask.priority || "Medium"}</span>
              </div>
            </div>

            {subtask.description && (
              <div className="subtask__info-item" style={{ marginTop: "8px" }}>
                <span className="subtask__info-label">Description</span>
                <p className="subtask__info-value--description">
                  {subtask.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtaskDescription;
