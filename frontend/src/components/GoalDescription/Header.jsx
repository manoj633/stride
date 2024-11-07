// Header.jsx
import React from "react";
import EditForm from "./EditForm";
import MetaInfo from "./MetaInfo";
import Actions from "./Actions";

const Header = ({
  goal,
  isEditing,
  editedGoal,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  setEditedGoal,
}) => (
  <div className="goal-description__header">
    {isEditing ? (
      <EditForm
        editedGoal={editedGoal}
        onSave={onSave}
        onCancel={onCancel}
        setEditedGoal={setEditedGoal}
      />
    ) : (
      <>
        <h1 className="goal-description__title">
          <span className="goal-description__id">{goal.id}</span>
          {goal.title}
        </h1>
        <MetaInfo goal={goal} />
        <Actions onEdit={onEdit} onDelete={onDelete} />
      </>
    )}
  </div>
);

export default Header;
