// InfoSection.jsx
import React from "react";

const InfoSection = ({ goal, tags, onRemoveTag, onAddTag }) => (
  <div className="goal-description__info">
    <p className="goal-description__text">{goal.description}</p>
    <div className="goal-description__tags">
      <div className="current-tags">
        {tags.map((tag, index) => (
          <span
            className="tag"
            key={`${tag._id}-${index}`}
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button className="remove-tag" onClick={() => onRemoveTag(tag._id)}>
              ×
            </button>
          </span>
        ))}
      </div>
      <button className="add-tag" onClick={onAddTag} type="button">
        + Add Tag
      </button>
    </div>
  </div>
);

export default InfoSection;
