// GoalDescription.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { toast } from "react-toastify";

import TagModal from "../TagModal/TagModal";
import Header from "./Header";
import Content from "./Content";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

// Import actions from slices
import {
  fetchGoals,
  updateGoal,
  deleteGoal,
  selectGoalById,
} from "../../store/features/goals/goalSlice";
import {
  fetchTasks,
  selectTasksByGoalId,
} from "../../store/features/tasks/taskSlice";
import {
  fetchGoalComments,
  createComment,
} from "../../store/features/comments/commentSlice";
import { fetchTags } from "../../store/features/tags/tagSlice";

import "./GoalDescription.css";

const GoalDescription = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const chartRef = React.useRef(null);

  const tagsStatus = useSelector((s) => s.tags.status);
  const tasksStatus = useSelector((s) => s.tasks.status);
  const goalsStatus = useSelector((s) => s.goals.status);

  // global/static data (ONCE per app lifecycle)
  useEffect(() => {
    if (tagsStatus === "idle") dispatch(fetchTags());
    if (tasksStatus === "idle") dispatch(fetchTasks());
    if (goalsStatus === "idle") dispatch(fetchGoals());
  }, [dispatch, tagsStatus, tasksStatus, goalsStatus]);

  // goal-specific data
  useEffect(() => {
    if (goalId) {
      dispatch(fetchGoalComments(goalId));
    }
  }, [dispatch, goalId]);

  // Redux state selectors
  const goal = useSelector((state) => selectGoalById(state, goalId));
  const tasks = useSelector((state) => selectTasksByGoalId(state, goalId));
  const comments = useSelector((state) => state.comments.items);
  const tags = useSelector((state) => state.tags.items);

  const error = useSelector((state) => state.goals.error); // Assuming error is stored in goals slice

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(null);
  const [comment, setComment] = useState("");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Get tag objects for the goal
  const tagsObjects = React.useMemo(() => {
    if (!goal?.tags || !tags.length) return [];

    return goal.tags
      .map((tagId) => tags.find((tag) => tag._id === tagId))
      .filter(Boolean);
  }, [goal?.tags, tags]);

  const goalDateRange = React.useMemo(() => {
    if (!goal?.duration?.startDate || !goal?.duration?.endDate) {
      return null;
    }

    return {
      start: goal.duration.startDate,
      end: goal.duration.endDate,
    };
  }, [goal]);

  // Handlers
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
          error: "Failed to delete goal 🤯",
        });
        navigate("/goals");
      } catch (error) {
        console.error("Error deleting goal:", error);
        toast.error("Failed to delete goal");
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
            error: "Failed to add comment 🤯",
          }
        );
        setComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
        toast.error("Failed to add comment");
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
          error: "Failed to add tag 🤯",
        }
      );
      setIsTagModalOpen(false);
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag");
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
            error: "Failed to remove tag 🤯",
          }
        );
      } catch (error) {
        console.error("Error removing tag:", error);
        toast.error("Failed to remove tag");
      }
    }
  };

  const isLoading =
    tagsStatus === "loading" ||
    tasksStatus === "loading" ||
    goalsStatus === "loading";

  if (isLoading) return <LoadingSpinner />;

  if (error) return <ErrorMessage message={error} />;

  if (!goal)
    return <div className="goal-description__notice">Goal not found.</div>;

  return (
    <div className="goal-description">
      <div className="goal-description__container">
        <Header
          goal={goal}
          tags={tags}
          isEditing={isEditing}
          editedGoal={editedGoal}
          onEdit={handleEdit}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onDelete={handleDelete}
          setEditedGoal={setEditedGoal}
        />

        <Content
          goal={goal}
          tags={tagsObjects}
          tasks={tasks}
          collaborators={[]} // This should come from a separate collaborators reducer if needed
          dependencies={[]} // This should come from a separate dependencies reducer if needed
          relatedGoals={[]} // This could be filtered from goals state if needed
          comments={comments}
          comment={comment}
          goalDateRange={goalDateRange}
          onAddComment={handleAddComment}
          setComment={setComment}
          onRemoveTag={handleRemoveTag}
          onAddTag={() => setIsTagModalOpen(true)}
        />

        <TagModal
          isOpen={isTagModalOpen}
          onClose={() => setIsTagModalOpen(false)}
          onSave={handleTagSave}
          availableTags={tags}
        />
      </div>
    </div>
  );
};

export default GoalDescription;
