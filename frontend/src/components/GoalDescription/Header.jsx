// Header.jsx
import React from "react";
import EditForm from "./EditForm";
import MetaInfo from "./MetaInfo";

const Header = ({
  goal,
  tags,
  isEditing,
  editedGoal,
  onSave,
  onCancel,
  setEditedGoal,
  isSaving = false,
  isDirty = false,
}) => (
  <div className="goal-description__header">
    {isEditing ? (
      <EditForm
        editedGoal={editedGoal}
        tags={tags}
        onSave={onSave}
        onCancel={onCancel}
        setEditedGoal={setEditedGoal}
        isSaving={isSaving}
        isDirty={isDirty}
      />
    ) : (
      <>
        <h1 className="goal-description__title">
          <span className="goal-description__id">{goal.id}</span>
          {goal.title}
        </h1>
        <MetaInfo goal={goal} />
      </>
    )}
  </div>
);

export default Header;
