// SubtaskDescription/SubtaskDescription.jsx
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
    dispatch(fetchSubtaskById(subtaskId));
  }, [dispatch, subtaskId]);

  console.log(subtask);

  const handleCheckboxChange = () => {
    const updatedSubtask = {
      ...subtask,
      completed: !subtask.completed,
    };

    dispatch(updateSubtask({ id: subtaskId, subtaskData: updatedSubtask }))
      .then(() => {
        if (subtask.taskId) {
          dispatch(
            updateTaskCompletion({
              taskId: subtask.taskId,
              subtasks: allSubtasks,
            })
          )
            .then(() => {
              // If task has goalId, update goal completion
              if (subtask.goalId) {
                dispatch(
                  updateGoalCompletion({
                    goalId: subtask.goalId,
                    subtasks: allSubtasks,
                  })
                )
                  .then(() => {
                    navigate(-1); // Navigate back after all updates are complete
                  })
                  .catch((error) => {
                    console.error("Failed to update goal completion:", error);
                  });
              } else {
                navigate(-1); // Navigate back if no goal update needed
              }
            })
            .catch((error) => {
              console.error("Failed to update task completion:", error);
            });
        } else {
          navigate(-1); // Navigate back if no task update needed
        }
      })
      .catch((error) => {
        console.error("Failed to update subtask:", error);
      });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this subtask?")) {
      dispatch(deleteSubtask(subtaskId))
        .then(() => {
          if (subtask.taskId) {
            dispatch(
              updateTaskCompletion({
                taskId: subtask.taskId,
                subtasks: allSubtasks.filter((st) => st._id !== subtaskId),
              })
            )
              .then(() => {
                if (subtask.goalId) {
                  dispatch(
                    updateGoalCompletion({
                      goalId: subtask.goalId,
                      subtasks: allSubtasks.filter(
                        (st) => st._id !== subtaskId
                      ),
                    })
                  );
                }
                navigate(-1);
              })
              .catch((error) => {
                console.error("Failed to update task completion:", error);
              });
          } else {
            navigate(-1);
          }
        })
        .catch((error) => {
          console.error("Failed to delete subtask:", error);
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
          />
          <label htmlFor="subtask-status" className="subtask__status-label">
            {subtask.completed ? "Completed" : "Mark as complete"}
          </label>
        </div>
        <h2 className="subtask__title">{subtask.name}</h2>
        <button onClick={handleDelete} className="subtask__delete-btn">
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
