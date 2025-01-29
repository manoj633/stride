// components/tags/TagManager.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
} from "../../store/features/tags/tagSlice";
import "./TagManager.css";

// Constants and utilities
const generatePastelColor = () => {
  const r = Math.floor(Math.random() * 55 + 200)
    .toString(16)
    .padStart(2, "0");
  const g = Math.floor(Math.random() * 55 + 200)
    .toString(16)
    .padStart(2, "0");
  const b = Math.floor(Math.random() * 55 + 200)
    .toString(16)
    .padStart(2, "0");
  return `#${r}${g}${b}`;
};

const tagPresets = [
  { name: "Important", color: "#ffb3ba" },
  { name: "Work", color: "#baffc9" },
  { name: "Personal", color: "#bae1ff" },
  { name: "Urgent", color: "#ffffba" },
];

const tagCategories = {
  "Task Status": [
    { name: "To Do", color: "#ff9aa2" },
    { name: "In Progress", color: "#ffdac1" },
    { name: "Done", color: "#c7ceea" },
  ],
  Priority: [
    { name: "Important", color: "#ff6b6b" },
    { name: "Urgent", color: "#ffd93d" },
    { name: "Low Priority", color: "#95e1d3" },
  ],
  Areas: [
    { name: "Work", color: "#a8e6cf" },
    { name: "Personal", color: "#dcedc1" },
    { name: "Study", color: "#ffd3b6" },
    { name: "Health", color: "#ffaaa5" },
  ],
  "Time Frame": [
    { name: "Today", color: "#ff8585" },
    { name: "This Week", color: "#82c1ff" },
    { name: "This Month", color: "#87e6b5" },
    { name: "Someday", color: "#b5b5ff" },
    { name: "Recurring", color: "#ffc385" },
  ],
};

const generateTagIcon = (name) => {
  const icons = {
    important: "⭐",
    urgent: "🔥",
    work: "💼",
    personal: "👤",
    home: "🏠",
    study: "📚",
    health: "❤️",
    finance: "💰",
    today: "📅",
    "this week": "📆",
    "this month": "📊",
    someday: "🔮",
    recurring: "🔄",
  };
  return icons[name.toLowerCase()] || "🏷️";
};

// Sub-components
const TagStats = ({ totalTags, recentlyUsedCount }) => (
  <div className="tag-manager__stats">
    <div className="tag-manager__stat-item">
      <span className="tag-manager__stat-value">{totalTags}</span>
      <span className="tag-manager__stat-label">Total Tags</span>
    </div>
    <div className="tag-manager__stat-item">
      <span className="tag-manager__stat-value">{recentlyUsedCount}</span>
      <span className="tag-manager__stat-label">Recently Used</span>
    </div>
  </div>
);

const TagSearch = ({ filterText, setFilterText, sortBy, setSortBy }) => (
  <div className="tag-manager__search-container">
    <input
      type="text"
      placeholder="🔍 Search tags..."
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      className="tag-manager__search"
    />
    <div className="tag-manager__view-options">
      <button
        className={`tag-manager__view-button ${
          sortBy === "name" ? "active" : ""
        }`}
        onClick={() => setSortBy("name")}
      >
        A-Z
      </button>
      <button
        className={`tag-manager__view-button ${
          sortBy === "color" ? "active" : ""
        }`}
        onClick={() => setSortBy("color")}
      >
        🎨
      </button>
    </div>
  </div>
);

const TagForm = ({
  newTag,
  setNewTag,
  handleCreateTag,
  showPresets,
  setShowPresets,
}) => (
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
          onClick={() => setNewTag({ ...newTag, color: generatePastelColor() })}
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
);

const TagList = ({
  tags,
  editingTag,
  setEditingTag,
  handleUpdateTag,
  handleDeleteTag,
}) => (
  <div className="tag-manager__list">
    {tags.map((tag) => (
      <div
        key={tag._id}
        className="tag-manager__item"
        style={{
          backgroundColor:
            editingTag?._id === tag._id ? editingTag.color : tag.color,
        }}
      >
        {editingTag?._id === tag._id ? (
          <div className="tag-manager__edit-group">
            <input
              type="text"
              className="tag-manager__edit-input"
              value={editingTag.name}
              onChange={(e) =>
                setEditingTag({ ...editingTag, name: e.target.value })
              }
              onBlur={() => handleUpdateTag(tag, true)}
              onKeyPress={(e) =>
                e.key === "Enter" && handleUpdateTag(tag, true)
              }
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
);

// Main Component
export const TagManager = () => {
  const dispatch = useAppDispatch();
  const { items: tags, loading, error } = useAppSelector((state) => state.tags);
  const [newTag, setNewTag] = useState({ name: "", color: "#ffb3ba" });
  const [editingTag, setEditingTag] = useState(null);
  const [showPresets, setShowPresets] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [recentlyUsed, setRecentlyUsed] = useState([]);

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

  const handleTagUsage = useCallback((tag) => {
    const now = new Date();
    setRecentlyUsed((prev) => {
      const updated = prev.filter((t) => t.id !== tag._id);
      return [{ id: tag._id, name: tag.name, usedAt: now }, ...updated].slice(
        0,
        5
      );
    });
  }, []);

  const filteredTags = tags
    .filter((tag) => tag.name.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) =>
      sortBy === "name"
        ? a.name.localeCompare(b.name)
        : a.color.localeCompare(b.color)
    );

  if (loading)
    return <div className="tag-manager__loading">Loading tags...</div>;
  if (error) return <div className="tag-manager__error">⚠️ {error}</div>;

  return (
    <div className="tag-manager">
      <div className="tag-manager__dashboard">
        <TagStats
          totalTags={tags.length}
          recentlyUsedCount={recentlyUsed.length}
        />
        <TagSearch
          filterText={filterText}
          setFilterText={setFilterText}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      <div className="tag-manager__categories">
        {Object.entries(tagCategories).map(([category, presets]) => (
          <div key={category} className="tag-manager__category">
            <h3 className="tag-manager__category-title">{category}</h3>
            <div className="tag-manager__preset-grid">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  className="tag-manager__preset-button"
                  style={{ backgroundColor: preset.color }}
                  onClick={() => setNewTag(preset)}
                >
                  {generateTagIcon(preset.name)}
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <TagForm
        newTag={newTag}
        setNewTag={setNewTag}
        handleCreateTag={handleCreateTag}
        showPresets={showPresets}
        setShowPresets={setShowPresets}
      />

      {showPresets && (
        <div className="tag-manager__presets">
          {tagPresets.map((preset) => (
            <button
              key={preset.name}
              className="tag-manager__preset-item"
              style={{ backgroundColor: preset.color }}
              onClick={() => handlePresetSelect(preset)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}

      <TagList
        tags={filteredTags}
        editingTag={editingTag}
        setEditingTag={setEditingTag}
        handleUpdateTag={handleUpdateTag}
        handleDeleteTag={handleDeleteTag}
      />
    </div>
  );
};
