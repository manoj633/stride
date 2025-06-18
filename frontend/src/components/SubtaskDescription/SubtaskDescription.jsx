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

const SubtaskDescription = () => {
  const { subtaskId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const allSubtasks = useSelector((state) => state.subtasks.items);

  // Redux selectors
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

    toast
      .promise(
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
            // If task has goalId, update goal completion
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
      )
      .finally(() => {
        navigate(-1); // Navigate back after all updates are complete
      });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this subtask?")) {
      toast
        .promise(
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
        )
        .finally(() => {
          navigate(-1);
        });
    }
  };

  if (loading) {
    return <div className="subtask">Loading...</div>;
  }

  if (error) {
    return <div className="subtask">Error: {error}</div>;
  }

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
    <div className="subtask">
      <div className="subtask__header">
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
        <h2 className="subtask__title">{subtask.name}</h2>
        <button
          onClick={handleDelete}
          className="subtask__delete-btn"
          aria-label="Delete subtask"
        >
          Delete Subtask
        </button>
      </div>

      <div className="subtask__content">
        <div className="subtask__info-card">
          <div className="subtask__info-item">
            <span className="subtask__info-label">Due Date</span>
            <span className="subtask__info-value">
              {new Date(subtask.dueDate).toLocaleDateString()}
            </span>
          </div>

          <div className="subtask__info-item">
            <span className="subtask__info-label">Description</span>
            <p className="subtask__info-value subtask__info-value--description">
              {subtask.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtaskDescription;
