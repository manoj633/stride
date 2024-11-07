// GoalDescription.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import TagModal from "../TagModal/TagModal";
import Header from "./Header";
import Content from "./Content";

import {
  addComment,
  commentsProvider,
  deleteGoal,
  goalsProvider,
  tagsProvider,
  tasksProvider,
  updateGoal,
} from "../../services/dataService";

import "./GoalDescription.css";

const GoalDescription = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();

  // Data providers
  const goals = goalsProvider();
  const tasks = tasksProvider().filter((task) => task.goalId === goalId);
  const goal = goals.find((g) => g.id === goalId);
  const [comments, setComments] = useState(
    commentsProvider().filter((c) => c.goalId === goalId)
  );

  // State variables
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(null);
  const [comment, setComment] = useState("");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const tagIds = goal.tags || [];
  const tags = tagsProvider();
  const tagsObjects = (goal.tags || []).map((tagId) =>
    tags.find((tag) => tag.id === tagId)
  );

  const collaborators = [];
  const dependencies = [];
  const relatedGoals = [];

  // Effects
  useEffect(() => {
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
  }, [goal.completionPercentage]);

  if (!goal)
    return <div className="goal-description__notice">Goal not found.</div>;

  // Handlers
  const handleEdit = () => {
    setEditedGoal({ ...goal });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedGoal) {
      updateGoal(editedGoal);
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
      deleteGoal(goalId);
      navigate("/goals");
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      const newComment = addComment(goalId, comment.trim(), "1");
      setComment("");
      setComments((prevComments) => [...prevComments, newComment]);
    }
  };

  const handleAddTag = () => setIsTagModalOpen(true);

  const handleTagSave = (selectedTagId) => {
    // Assuming selectedTagId is passed from TagModal
    const updatedTags = [...goal.tags, selectedTagId];
    updateGoal({ ...goal, tags: updatedTags });
  };

  const handleRemoveTag = (tagId) => {
    const updatedTags = goal.tags.filter((id) => id !== tagId);
    updateGoal({ ...goal, tags: updatedTags });
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
          collaborators={collaborators}
          dependencies={dependencies}
          relatedGoals={relatedGoals}
          comments={comments}
          comment={comment}
          onAddComment={handleAddComment}
          setComment={setComment}
          onRemoveTag={handleRemoveTag}
          onAddTag={handleAddTag}
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
