// components/tags/TagManager.jsx
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  setSelectedTag,
} from "../../store/features/tags/tagSlice";
import "./TagManager.css";

const generatePastelColor = () => {
  // Generate random RGB values
  const r = Math.floor(Math.random() * 55 + 200).toString(16); // 200-255
  const g = Math.floor(Math.random() * 55 + 200).toString(16); // 200-255
  const b = Math.floor(Math.random() * 55 + 200).toString(16); // 200-255

  // Ensure each component has 2 digits
  const rr = r.length === 1 ? "0" + r : r;
  const gg = g.length === 1 ? "0" + g : g;
  const bb = b.length === 1 ? "0" + b : b;

  return `#${rr}${gg}${bb}`;
};

const tagPresets = [
  { name: "Important", color: "#ffb3ba" },
  { name: "Work", color: "#baffc9" },
  { name: "Personal", color: "#bae1ff" },
  { name: "Urgent", color: "#ffffba" },
];

export const TagManager = () => {
  const dispatch = useAppDispatch();
  const { items: tags, loading, error } = useAppSelector((state) => state.tags);
  const [newTag, setNewTag] = useState({ name: "", color: "#ffb3ba" });
  const [editingTag, setEditingTag] = useState(null);
  const [showPresets, setShowPresets] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  const handleCreateTag = (e) => {
    e.preventDefault();
    if (newTag.name.trim()) {
      dispatch(createTag({ name: newTag.name.trim(), color: newTag.color }));
      setNewTag({ name: "", color: "#ffb3ba" });
    }
  };

  const handleUpdateTag = (tag, forceUpdate = false) => {
    if (
      editingTag &&
      forceUpdate &&
      (editingTag.name.trim() !== tag.name || editingTag.color !== tag.color)
    ) {
      dispatch(
        updateTag({
          id: tag._id,
          tagData: {
            name: editingTag.name.trim(),
            color: editingTag.color,
          },
        })
      );
      setEditingTag(null);
    }
  };

  const handleDeleteTag = (tagId) => {
    const tag = tags.find((t) => t._id === tagId);
    if (window.confirm(`Are you sure you want to delete "${tag.name}"?`)) {
      dispatch(deleteTag(tagId));
    }
  };

  const handlePresetSelect = (preset) => {
    setNewTag(preset);
    setShowPresets(false);
  };

  const filteredTags = tags
    .filter((tag) => tag.name.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return a.color.localeCompare(b.color);
    });

  if (loading)
    return (
      <div className="tag-manager__loading">
        <div className="spinner"></div>
        <span>Loading tags...</span>
      </div>
    );

  if (error)
    return (
      <div className="tag-manager__error">
        <span className="error-icon">⚠️</span>
        <span>{error}</span>
      </div>
    );

  return (
    <div className="tag-manager">
      <div className="tag-manager__header">
        <h2>Tag Manager</h2>
        <div className="tag-manager__controls">
          <input
            type="text"
            placeholder="Filter tags..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="tag-manager__filter"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="tag-manager__sort"
          >
            <option value="name">Sort by name</option>
            <option value="color">Sort by color</option>
          </select>
        </div>
      </div>

      <form className="tag-manager__form" onSubmit={handleCreateTag}>
        <div className="tag-manager__input-group">
          <input
            type="text"
            className="tag-manager__input"
            placeholder="Enter new tag name"
            value={newTag.name}
            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
          />
          <div className="tag-manager__color-controls">
            <input
              type="color"
              className="tag-manager__color-picker"
              value={newTag.color}
              onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
            />
            <button
              type="button"
              className="tag-manager__random-color"
              onClick={() =>
                setNewTag({ ...newTag, color: generatePastelColor() })
              }
              title="Generate random color"
            >
              🎲
            </button>
          </div>
        </div>
        <button
          type="button"
          className="tag-manager__button tag-manager__button--preset"
          onClick={() => setShowPresets(!showPresets)}
        >
          Presets
        </button>
        <button
          type="submit"
          className="tag-manager__button tag-manager__button--create"
          disabled={!newTag.name.trim()}
        >
          Add Tag
        </button>
      </form>

      {showPresets && (
        <div className="tag-manager__presets">
          {tagPresets.map((preset, index) => (
            <button
              key={index}
              className="tag-manager__preset-item"
              style={{ backgroundColor: preset.color }}
              onClick={() => handlePresetSelect(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}

      <div className="tag-manager__list">
        {filteredTags.map((tag) => (
          <div
            key={tag._id}
            className="tag-manager__item"
            style={{
              backgroundColor:
                editingTag && editingTag._id === tag._id
                  ? editingTag.color
                  : tag.color,
            }}
          >
            {editingTag && editingTag._id === tag._id ? (
              <div className="tag-manager__edit-group">
                <input
                  type="text"
                  className="tag-manager__edit-input"
                  value={editingTag.name}
                  onChange={(e) =>
                    setEditingTag({ ...editingTag, name: e.target.value })
                  }
                  onBlur={(e) => {
                    if (
                      !e.relatedTarget?.classList.contains(
                        "tag-manager__color-picker"
                      )
                    ) {
                      handleUpdateTag(tag, true);
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateTag(tag, true);
                    }
                  }}
                  autoFocus
                />
                <input
                  type="color"
                  className="tag-manager__color-picker"
                  value={editingTag.color}
                  onChange={(e) => {
                    setEditingTag({ ...editingTag, color: e.target.value });
                    handleUpdateTag(tag, true);
                  }}
                  onBlur={() => handleUpdateTag(tag, true)}
                />
              </div>
            ) : (
              <span className="tag-manager__name">{tag.name}</span>
            )}

            <div className="tag-manager__actions">
              <button
                className="tag-manager__button tag-manager__button--edit"
                onClick={() => setEditingTag(tag)}
              >
                Edit
              </button>
              <button
                className="tag-manager__button tag-manager__button--delete"
                onClick={() => handleDeleteTag(tag._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
