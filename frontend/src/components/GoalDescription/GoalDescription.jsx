// GoalDescription.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import TagModal from "../TagModal/TagModal";
import Header from "./Header";
import Content from "./Content";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

import {
  fetchGoals,
  fetchGoalById,
  updateGoal,
  deleteGoal,
  archiveGoal,
  unarchiveGoal,
  selectGoalById,
} from "../../store/features/goals/goalSlice";
import {
  fetchTasks,
  selectTasksByGoalId,
} from "../../store/features/tasks/taskSlice";
import {
  fetchGoalComments,
  createComment,
  updateComment,
  deleteComment,
} from "../../store/features/comments/commentSlice";
import { fetchTags } from "../../store/features/tags/tagSlice";

import "./GoalDescription.css";

const GoalDescription = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tagsStatus = useSelector((s) => s.tags.status);
  const tasksStatus = useSelector((s) => s.tasks.status);
  const goalsStatus = useSelector((s) => s.goals.status);

  const goal = useSelector((state) => selectGoalById(state, goalId));
  const tasks = useSelector((state) => selectTasksByGoalId(state, goalId));
  const comments = useSelector((state) => state.comments.items);
  const tags = useSelector((state) => state.tags.items);
  const currentUser = useSelector((state) => state.user.userInfo);
  const error = useSelector((state) => state.goals.error);

  useEffect(() => {
    if (tagsStatus === "idle") dispatch(fetchTags());
    if (tasksStatus === "idle") dispatch(fetchTasks());
    if (goalsStatus === "idle") dispatch(fetchGoals());
  }, [dispatch, tagsStatus, tasksStatus, goalsStatus]);

  const hasFetchedAllTasksRef = useRef(false);

  useEffect(() => {
    hasFetchedAllTasksRef.current = false;
  }, [goalId]);

  // Ensure this specific goal is fetched even if not in current year's cache
  useEffect(() => {
    if (goalId && !goal) {
      dispatch(fetchGoalById(goalId));
    }
  }, [dispatch, goalId, goal]);

  // If goal exists but tasks are empty and tasks were only loaded for a specific year, fetch all tasks once
  useEffect(() => {
    if (
      goalId &&
      goal &&
      tasks.length === 0 &&
      tasksStatus === "succeeded" &&
      !hasFetchedAllTasksRef.current
    ) {
      hasFetchedAllTasksRef.current = true;
      dispatch(fetchTasks({ year: "all" }));
    }
  }, [dispatch, goalId, goal, tasks.length, tasksStatus]);

  useEffect(() => {
    if (goalId) {
      dispatch(fetchGoalComments(goalId));
    }
  }, [dispatch, goalId]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(null);
  const [comment, setComment] = useState("");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const tagsObjects = React.useMemo(() => {
    if (!goal?.tags || !tags.length) return [];
    return goal.tags
      .map((tagId) => tags.find((tag) => tag._id === tagId))
      .filter(Boolean);
  }, [goal?.tags, tags]);

  const goalDateRange = React.useMemo(() => {
    if (!goal?.duration?.startDate || !goal?.duration?.endDate) return null;
    return {
      start: goal.duration.startDate,
      end: goal.duration.endDate,
    };
  }, [goal]);

  const handleEdit = () => {
    setEditedGoal({ ...goal });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editedGoal) {
      try {
        await dispatch(
          updateGoal({ id: editedGoal._id, goalData: editedGoal })
        ).unwrap();
        toast.success("Goal updated successfully");
      } catch (error) {
        console.error("Error updating goal:", error);
        toast.error("Failed to update goal");
      }
      setIsEditing(false);
      setEditedGoal(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedGoal(null);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await toast.promise(dispatch(deleteGoal(goalId)).unwrap(), {
          pending: "Deleting goal...",
          success: "Goal deleted successfully!",
          error: "Failed to delete goal",
        });
        navigate("/goals");
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  const handleAddComment = async () => {
    if (comment.trim()) {
      try {
        const userInfoString = localStorage.getItem("userInfo");
        const userInfo = JSON.parse(userInfoString);
        const userId = userInfo._id;

        await toast.promise(
          dispatch(
            createComment({ goalId, text: comment.trim(), authorId: userId })
          ).unwrap(),
          {
            pending: "Adding comment...",
            success: "Comment added!",
            error: "Failed to add comment",
          }
        );
        setComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const handleUpdateComment = async (commentId, text) => {
    try {
      await toast.promise(
        dispatch(updateComment({ commentId, text })).unwrap(),
        {
          pending: "Updating comment...",
          success: "Comment updated!",
          error: "Failed to update comment",
        }
      );
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await toast.promise(
          dispatch(deleteComment(commentId)).unwrap(),
          {
            pending: "Deleting comment...",
            success: "Comment deleted!",
            error: "Failed to delete comment",
          }
        );
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleTagSave = async (selectedTagId) => {
    const updatedTags = [...(goal.tags || []), selectedTagId];
    try {
      await toast.promise(
        dispatch(
          updateGoal({
            id: goal._id,
            goalData: { ...goal, tags: updatedTags },
          })
        ).unwrap(),
        {
          pending: "Adding tag...",
          success: "Tag added!",
          error: "Failed to add tag",
        }
      );
      setIsTagModalOpen(false);
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const handleRemoveTag = async (tagId) => {
    if (window.confirm("Are you sure you want to remove this tag?")) {
      const updatedTags = goal.tags.filter((id) => id !== tagId);
      try {
        await toast.promise(
          dispatch(
            updateGoal({
              id: goal._id,
              goalData: { ...goal, tags: updatedTags },
            })
          ).unwrap(),
          {
            pending: "Removing tag...",
            success: "Tag removed!",
            error: "Failed to remove tag",
          }
        );
      } catch (error) {
        console.error("Error removing tag:", error);
      }
    }
  };

  const isLoading =
    tagsStatus === "loading" ||
    tasksStatus === "loading" ||
    goalsStatus === "loading";

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  if (!goal) {
    return (
      <div className="goal-description">
        <div className="ef-body">
          <div className="goal-description__notice">Goal not found.</div>
        </div>
      </div>
    );
  }

  const handleArchive = async () => {
    try {
      await dispatch(archiveGoal(goal._id)).unwrap();
      toast.success("Goal archived successfully!");
    } catch (err) {
      toast.error("Failed to archive goal.");
    }
  };

  const handleUnarchive = async () => {
    try {
      await dispatch(unarchiveGoal(goal._id)).unwrap();
      toast.success("Goal unarchived successfully!");
    } catch (err) {
      toast.error("Failed to unarchive goal.");
    }
  };

  return (
    <div className="goal-description">
      {/* Top bar */}
      <div className="ef-topbar">
        <div className="ef-topbar__icon">G</div>
        <span className="ef-topbar__title">Goal Details</span>
        <span className="ef-topbar__breadcrumb">
          / <span>{goal.title}</span>
          {goal.archived && (
            <span
              style={{
                marginLeft: "8px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                padding: "2px 6px",
                borderRadius: "4px",
                background: "var(--bg-subtle, #f1f5f9)",
                color: "var(--text-tertiary, #64748b)",
                border: "1px solid var(--border, #e2e8f0)",
              }}
            >
              Archived
            </span>
          )}
        </span>
        <div className="ef-topbar__actions">
          {!isEditing && (
            <>
              {goal.archived ? (
                <button
                  className="ef-btn-ghost"
                  onClick={handleUnarchive}
                  type="button"
                >
                  Unarchive Goal
                </button>
              ) : (
                <button
                  className="ef-btn-ghost"
                  onClick={handleArchive}
                  type="button"
                >
                  Archive Goal
                </button>
              )}
              <button
                className="ef-btn-primary"
                onClick={handleEdit}
              >
                Edit Goal
              </button>
              <button
                className="ef-btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </>
          )}
          <button
            className="ef-btn-ghost"
            onClick={() => navigate("/goals")}
            type="button"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="ef-body">
        <div className="goal-layout">
          <div className="goal-card">
            <Header
              goal={goal}
              tags={tags}
              isEditing={isEditing}
              editedGoal={editedGoal}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              setEditedGoal={setEditedGoal}
              // Removed onEdit and onDelete props as they are now in Topbar
            />
            {!isEditing && (
              <Content
                goal={goal}
                tags={tagsObjects}
                tasks={tasks}
                collaborators={[]}
                dependencies={[]}
                relatedGoals={[]}
                comments={comments}
                comment={comment}
                goalDateRange={goalDateRange}
                onAddComment={handleAddComment}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
                currentUserId={currentUser?._id}
                isAdmin={currentUser?.isAdmin || false}
                setComment={setComment}
                onRemoveTag={handleRemoveTag}
                onAddTag={() => setIsTagModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onSave={handleTagSave}
        availableTags={tags}
      />
    </div>
  );
};

export default GoalDescription;
