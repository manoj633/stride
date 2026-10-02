// InfoSection.jsx
import React from "react";

// Derive high-contrast readable text color from background hex
const getTagTextColor = (hex) => {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return "#FFFFFF";
  const cleanHex =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  const r = parseInt(cleanHex.slice(1, 3), 16) || 0;
  const g = parseInt(cleanHex.slice(3, 5), 16) || 0;
  const b = parseInt(cleanHex.slice(5, 7), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#18181B" : "#FFFFFF";
};

const InfoSection = ({ goal, tags, onRemoveTag, onAddTag }) => (
  <div className="goal-description__info">
    <p className="goal-description__text">{goal.description}</p>
    <div className="goal-description__tags">
      <div className="current-tags">
        {tags.map((tag, index) => {
          const bgColor = tag.color || "var(--ef-accent, #2563eb)";
          const textColor = getTagTextColor(tag.color);
          return (
            <span
              className="tag"
              key={`${tag._id}-${index}`}
              style={{
                backgroundColor: bgColor,
                color: textColor,
                borderColor: tag.color ? "rgba(0, 0, 0, 0.12)" : undefined,
              }}
            >
              {tag.name}
              <button
                type="button"
                className="remove-tag"
                onClick={() => onRemoveTag(tag._id)}
                style={{ color: textColor }}
                title={`Remove ${tag.name}`}
                aria-label={`Remove ${tag.name}`}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>
      <button className="add-tag" onClick={onAddTag} type="button">
        + Add Tag
      </button>
    </div>
  </div>
);

export default InfoSection;
