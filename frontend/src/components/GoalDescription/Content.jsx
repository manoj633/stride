// Content.jsx
import React from "react";
import InfoSection from "./InfoSection.jsx";
import ProgressChart from "./ProgressChart.jsx";
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
    {/* <Collaborators collaborators={collaborators} /> */}
    {/* <Dependencies dependencies={dependencies} /> */}
    <TaskSection tasks={tasks} goalDateRange={goalDateRange} />
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
