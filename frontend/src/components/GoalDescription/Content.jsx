// Content.jsx
import React from "react";
import InfoSection from "./InfoSection.jsx";
import ProgressChart from "./ProgressChart.jsx";
import AIPrediction from "./AIPrediction.jsx";
import Collaborators from "./Collaborators.jsx";
import Dependencies from "./Dependencies.jsx";
import TaskSection from "./TaskSection.jsx";
import RelatedGoals from "./RelatedGoals.jsx";
import CommentsSection from "./CommentsSection.jsx";

const Content = ({
  goal,
  tags,
  tasks,
  collaborators,
  dependencies,
  relatedGoals,
  comments,
  comment,
  goalDateRange,
  onAddComment,
  setComment,
  onRemoveTag,
  onAddTag,
}) => (
  <div className="goal-description__content">
    <InfoSection
      goal={goal}
      tags={tags}
      onRemoveTag={onRemoveTag}
      onAddTag={onAddTag}
    />
    <ProgressChart goal={goal} />
    <AIPrediction goalId={goal._id} />
    {/* <Collaborators collaborators={collaborators} /> */}
    <TaskSection tasks={tasks} goalDateRange={goalDateRange} isArchived={goal?.archived} goalId={goal?._id} />
    <RelatedGoals relatedGoals={relatedGoals} />
    <CommentsSection
      comments={comments}
      comment={comment}
      onAddComment={onAddComment}
      setComment={setComment}
    />
  </div>
);

export default Content;
