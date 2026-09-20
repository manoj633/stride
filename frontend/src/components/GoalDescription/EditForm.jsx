// EditForm.jsx
import React from "react";

const formatDateForInput = (val) => {
  if (!val) return "";
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const EditForm = ({
  editedGoal,
  tags,
  onSave,
  onCancel,
  setEditedGoal,
  isSaving = false,
  isDirty = false,
}) => (
  <div className="goal-edit-form">
    <div className="form-group">
      <label htmlFor="title">Title:</label>
      <input
        type="text"
        id="title"
        value={editedGoal.title || ""}
        onChange={(e) =>
          setEditedGoal({ ...editedGoal, title: e.target.value })
        }
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="description">Description:</label>
      <textarea
        id="description"
        value={editedGoal.description || ""}
        onChange={(e) =>
          setEditedGoal({ ...editedGoal, description: e.target.value })
        }
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="category">Category:</label>
      <select
        id="category"
        value={editedGoal.category || "Education"}
        onChange={(e) =>
          setEditedGoal({ ...editedGoal, category: e.target.value })
        }
      >
        <option value="Education">Education</option>
        <option value="Health">Health</option>
        <option value="Leisure">Leisure</option>
        <option value="Fitness">Fitness</option>
        <option value="Career">Career</option>
      </select>
    </div>
    <div className="form-group">
      <label htmlFor="priority">Priority:</label>
      <select
        id="priority"
        value={editedGoal.priority || "Medium"}
        onChange={(e) =>
          setEditedGoal({ ...editedGoal, priority: e.target.value })
        }
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>

    <div className="form-group">
      <label htmlFor="startDate">Start Date:</label>
      <input
        type="date"
        id="startDate"
        value={formatDateForInput(editedGoal.duration?.startDate)}
        onChange={(e) =>
          setEditedGoal({
            ...editedGoal,
            duration: {
              ...editedGoal.duration,
              startDate: e.target.value,
            },
          })
        }
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="endDate">End Date:</label>
      <input
        type="date"
        id="endDate"
        value={formatDateForInput(editedGoal.duration?.endDate)}
        onChange={(e) =>
          setEditedGoal({
            ...editedGoal,
            duration: {
              ...editedGoal.duration,
              endDate: e.target.value,
            },
          })
        }
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="tags">Tags:</label>
      <select
        multiple
        id="tags"
        value={editedGoal.tags || []}
        onChange={(e) =>
          setEditedGoal({
            ...editedGoal,
            tags: Array.from(
              e.target.selectedOptions,
              (option) => option.value
            ),
          })
        }
      >
        {tags.map((tag) => (
          <option key={tag._id} value={tag._id}>
            {tag.name}
          </option>
        ))}
      </select>
    </div>
    <div className="goal-edit-actions">
      <button
        type="button"
        className="ef-btn-primary"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
      <button
        type="button"
        className="ef-btn-ghost"
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </button>
      {isDirty && (
        <span className="goal-edit-unsaved-badge">
          • Unsaved changes
        </span>
      )}
    </div>
  </div>
);

export default EditForm;
