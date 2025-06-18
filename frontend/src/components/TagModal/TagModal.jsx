// TagModal.jsx
import React, { useState } from "react";
import "./TagModal.css";

const TagModal = ({ isOpen, onClose, onSave, availableTags }) => {
  const [selectedTagId, setSelectedTagId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTagId) {
      onSave(selectedTagId);
      setSelectedTagId("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tag-modal-overlay">
      <div className="tag-modal">
        <h3>Select Tag</h3>
        <form onSubmit={handleSubmit}>
          <div className="tag-modal__input-group">
            <label htmlFor="tagSelect">Choose a tag:</label>
            <select
              id="tagSelect"
              value={selectedTagId}
              onChange={(e) => {
                setSelectedTagId(e.target.value);
              }}
              required
              aria-label="Select a tag"
            >
              <option value="">Select a tag</option>
              {availableTags.map((tag) => (
                <option key={tag._id} value={tag._id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          <div className="tag-preview">
            {selectedTagId && (
              <div
                className="tag-sample"
                style={{
                  backgroundColor: availableTags.find(
                    (t) => t._id === selectedTagId
                  )?.color,
                }}
              >
                {availableTags.find((t) => t._id === selectedTagId)?.name}
              </div>
            )}
          </div>
          <div className="tag-modal__actions">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cancel tag selection"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTagId}
              aria-label="Add selected tag"
            >
              Add Tag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TagModal;
