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

// Import actions from slices
import {
  fetchGoals,
  updateGoal,
  deleteGoal,
} from "../../store/features/goals/goalSlice";
import { fetchTasks } from "../../store/features/tasks/taskSlice";
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

  // Redux state selectors
  const goal = useSelector((state) =>
    state.goals.items.find((g) => g._id === goalId)
  );
  const tasks = useSelector((state) =>
    state.tasks.items.filter((task) => task.goalId === goalId)
  );
  const comments = useSelector((state) => state.comments.items);
  const tags = useSelector((state) => state.tags.items);
  const loading = useSelector(
    (state) =>
      state.goals.loading || state.tasks.loading || state.comments.loading
  );

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(null);
  const [comment, setComment] = useState("");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Get tag objects for the goal
  const tagsObjects =
    goal?.tags
      ?.map((tagId) => tags.find((tag) => tag._id === tagId))
      .filter(Boolean) || [];

  // Effects
  useEffect(() => {
    if (!goal) {
      dispatch(fetchGoals());
    }
    if (tasks.length === 0) {
      dispatch(fetchTasks());
    }
    dispatch(fetchTags());
    dispatch(fetchGoalComments(goalId));
  }, [dispatch, goalId, goal, tasks.length]);

  useEffect(() => {
    if (goal) {
      const chart = am4core.create("goal-chart", am4charts.PieChart3D);
      chart.data = [
        { category: "Completed", value: goal.completionPercentage },
        { category: "Remaining", value: 100 - goal.completionPercentage },
      ];

      const pieSeries = chart.series.push(new am4charts.PieSeries3D());
      pieSeries.dataFields.value = "value";
      pieSeries.dataFields.category = "category";
      pieSeries.innerRadius = am4core.percent(40);
      pieSeries.colors.list = [
        am4core.color("#1a73e8"),
        am4core.color("#e0e0e0"),
      ];

      return () => chart.dispose();
    }
  }, [goal?.completionPercentage]);

  if (!goal && !loading)
    return <div className="goal-description__notice">Goal not found.</div>;
  if (loading)
    return <div className="goal-description__notice">Loading...</div>;

  // Handlers
  const handleEdit = () => {
    setEditedGoal({ ...goal });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (editedGoal) {
      try {
        await toast.promise(
          dispatch(
            updateGoal({ id: editedGoal._id, goalData: editedGoal })
          ).unwrap(),
          {
            pending: "Saving changes...",
            success: "Goal updated successfully!",
            error: "Failed to update goal 🤯",
          }
        );
        setIsEditing(false);
        setEditedGoal(null);
      } catch (error) {
        console.error("Error updating goal:", error);
        toast.error("Failed to update goal");
      }
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
        await toast.promise(
          dispatch(
            createComment({ goalId, text: comment.trim(), authorId: "1" })
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
