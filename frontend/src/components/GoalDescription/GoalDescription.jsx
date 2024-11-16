// GoalDescription.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import TagModal from "../TagModal/TagModal";
import Header from "./Header";
import Content from "./Content";

// Import actions from slices
import {
  fetchGoals,
  updateGoal,
  deleteGoal,
  setSelectedGoal,
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
    dispatch(fetchGoals());
    dispatch(fetchTasks());
    dispatch(fetchTags());
    dispatch(fetchGoalComments(goalId));
  }, [dispatch, goalId]);

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

  const handleSaveEdit = () => {
    if (editedGoal) {
      dispatch(updateGoal({ id: editedGoal._id, goalData: editedGoal }));
      setIsEditing(false);
      setEditedGoal(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedGoal(null);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      dispatch(deleteGoal(goalId));
      navigate("/goals");
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      dispatch(createComment({ goalId, text: comment.trim(), authorId: "1" }));
      setComment("");
    }
  };

  const handleTagSave = (selectedTagId) => {
    const updatedTags = [...(goal.tags || []), selectedTagId];
    console.log(updatedTags);
    dispatch(
      updateGoal({
        id: goal._id,
        goalData: { ...goal, tags: updatedTags },
      })
    );
    setIsTagModalOpen(false);
  };

  const handleRemoveTag = (tagId) => {
    if (window.confirm("Are you sure you want to remove this tag?")) {
      const updatedTags = goal.tags.filter((id) => id !== tagId);
      dispatch(
        updateGoal({
          id: goal._id,
          goalData: { ...goal, tags: updatedTags },
        })
      );
    }
  };

  return (
    <div className="goal-description">
      <div className="goal-description__container">
        <Header
          goal={goal}
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
