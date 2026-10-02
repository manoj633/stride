// Content.jsx
import React from "react";
import InfoSection from "./InfoSection.jsx";
import ProgressChart from "./ProgressChart.jsx";
import AIPrediction from "./AIPrediction.jsx";
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
  onUpdateComment,
  onDeleteComment,
  currentUserId,
  isAdmin,
  setComment,
  onRemoveTag,
  onAddTag,
}) => (
  <div className="goal-description__content">
    {/* Left Column: Info, AI Coach, and Related Goals */}
    <div className="goal-description__col goal-description__col--left">
      <InfoSection
        goal={goal}
        tags={tags}
        onRemoveTag={onRemoveTag}
        onAddTag={onAddTag}
      />
      <AIPrediction goalId={goal._id} />
      {relatedGoals && relatedGoals.length > 0 && (
        <RelatedGoals relatedGoals={relatedGoals} />
      )}
    </div>

    {/* Right Column: Progress Donut & Tasks List */}
    <div className="goal-description__col goal-description__col--right">
      <ProgressChart goal={goal} />
      <TaskSection
        tasks={tasks}
        goalDateRange={goalDateRange}
        isArchived={goal?.archived}
        goalId={goal?._id}
      />
    </div>

    {/* Full-width Notes & Comments Section */}
    <div className="goal-description__full-width">
      <CommentsSection
        comments={comments}
        comment={comment}
        onAddComment={onAddComment}
        onUpdateComment={onUpdateComment}
        onDeleteComment={onDeleteComment}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        setComment={setComment}
      />
    </div>
  </div>
);

export default Content;
