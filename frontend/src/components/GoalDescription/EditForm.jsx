// EditForm.jsx
import React from "react";

const EditForm = ({ editedGoal, onSave, onCancel, setEditedGoal }) => (
  <div className="goal-edit-form">
    <input
      type="text"
      value={editedGoal.title}
      onChange={(e) => setEditedGoal({ ...editedGoal, title: e.target.value })}
    />
    <textarea
      value={editedGoal.description}
      onChange={(e) =>
        setEditedGoal({ ...editedGoal, description: e.target.value })
      }
    />
    <button onClick={onSave}>Save</button>
    <button onClick={onCancel}>Cancel</button>
  </div>
);

export default EditForm;
