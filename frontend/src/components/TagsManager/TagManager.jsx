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
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

const generatePastelColor = () => {
  const r = Math.floor(Math.random() * 55 + 200).toString(16);
  const g = Math.floor(Math.random() * 55 + 200).toString(16);
  const b = Math.floor(Math.random() * 55 + 200).toString(16);
  const rr = r.length === 1 ? "0" + r : r;
  const gg = g.length === 1 ? "0" + g : g;
  const bb = b.length === 1 ? "0" + b : b;
  return `#${rr}${gg}${bb}`;
};

const tagCategories = {
  "Task Status": [
    { name: "To Do", color: "#fee2e2" },
    { name: "In Progress", color: "#fef3c7" },
    { name: "Done", color: "#dcfce7" },
  ],
  Priority: [
    { name: "Important", color: "#fee2e2" },
    { name: "Urgent", color: "#fef9c3" },
    { name: "Low Priority", color: "#f0fdf4" },
  ],
  Areas: [
    { name: "Work", color: "#dbeafe" },
    { name: "Personal", color: "#fae8ff" },
    { name: "Study", color: "#fff7ed" },
    { name: "Health", color: "#f0fdf4" },
  ],
  "Time Frame": [
    { name: "Today", color: "#fee2e2" },
    { name: "This Week", color: "#dbeafe" },
    { name: "This Month", color: "#dcfce7" },
    { name: "Someday", color: "#f5f3ff" },
  ],
};

// Derive a readable foreground color from a background hex
const getTextColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#18181B" : "#FFFFFF";
};

export const TagManager = () => {
  const dispatch = useAppDispatch();
  const { items: tags, loading, error } = useAppSelector((state) => state.tags);

  const [newTag, setNewTag] = useState({ name: "", color: "#BFDBFE" });
  const [editingTag, setEditingTag] = useState(null);
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
      setNewTag({ name: "", color: "#BFDBFE" });
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
          tagData: { name: editingTag.name.trim(), color: editingTag.color },
        })
      );
      setEditingTag(null);
    } else if (forceUpdate) {
      setEditingTag(null);
    }
  };

  const handleDeleteTag = (tagId) => {
    const tag = tags.find((t) => t._id === tagId);
    if (window.confirm(`Delete tag "${tag.name}"?`)) {
      dispatch(deleteTag(tagId));
    }
  };

  const handleTagUsage = useCallback((tag) => {
    setRecentlyUsed((prev) => {
      const updated = prev.filter((t) => t.id !== tag._id);
      return [{ id: tag._id, name: tag.name, color: tag.color, usedAt: new Date() }, ...updated].slice(0, 5);
    });
  }, []);

  const filteredTags = tags
    .filter((tag) => tag.name.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) =>
      sortBy === "name" ? a.name.localeCompare(b.name) : a.color.localeCompare(b.color)
    );

  if (loading) return <LoadingSpinner message="Loading tags..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="tm-container">
      {/* ── Top bar ── */}
      <div className="tm-topbar">
        <div className="tm-topbar__icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </div>
        <span className="tm-topbar__title">Tags</span>
        <div className="tm-topbar__stats">
          <div className="tm-stat">
            <span className="tm-stat__value">{tags.length}</span>
            <span className="tm-stat__label">Total</span>
          </div>
          <div className="tm-stat">
            <span className="tm-stat__value">{recentlyUsed.length}</span>
            <span className="tm-stat__label">Recent</span>
          </div>
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <div className="tm-main">
        {/* ── LEFT: Create + Presets ── */}
        <div className="tm-left">
          {/* Create tag card */}
          <div className="tm-card">
            <div className="tm-card__header">
              <h3>New Tag</h3>
              <p>Name it and pick a color</p>
            </div>
            <form onSubmit={handleCreateTag} className="tm-card__body">
              <div className="tm-field">
                <label htmlFor="tag-name">Tag Name</label>
                <input
                  id="tag-name"
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  placeholder="e.g. Important"
                  aria-label="New tag name"
                />
              </div>

              <div className="tm-field">
                <label>Color</label>
                <div className="tm-color-row">
                  <input
                    type="color"
                    className="tm-color-input"
                    value={newTag.color}
                    onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                    title="Pick color"
                  />
                  <div
                    className="tm-color-preview"
                    style={{ background: newTag.color, color: getTextColor(newTag.color) }}
                  >
                    {newTag.name || "Preview"}
                  </div>
                  <button
                    type="button"
                    className="tm-btn tm-btn--ghost"
                    onClick={() => setNewTag({ ...newTag, color: generatePastelColor() })}
                    title="Random color"
                  >
                    ↻
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="tm-btn tm-btn--primary"
                disabled={!newTag.name.trim()}
              >
                + Create Tag
              </button>
            </form>
          </div>

          {/* Presets card */}
          <div className="tm-card">
            <div className="tm-card__header">
              <h3>Quick Presets</h3>
              <p>Click any preset to pre-fill the form</p>
            </div>
            <div className="tm-card__body">
              {Object.entries(tagCategories).map(([category, presets]) => (
                <div key={category} className="tm-preset-group">
                  <span className="tm-preset-group__label">{category}</span>
                  <div className="tm-preset-chips">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        className="tm-preset-chip"
                        style={{
                          background: preset.color,
                          color: getTextColor(preset.color),
                          borderColor: preset.color,
                        }}
                        onClick={() => setNewTag(preset)}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Tag list ── */}
        <div className="tm-right">
          {/* Search + sort bar */}
          <div className="tm-list-header">
            <input
              type="text"
              className="tm-search"
              placeholder="Search tags..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              aria-label="Search tags"
            />
            <div className="tm-sort-group">
              <button
                className={`tm-sort-btn ${sortBy === "name" ? "active" : ""}`}
                onClick={() => setSortBy("name")}
              >
                A–Z
              </button>
              <button
                className={`tm-sort-btn ${sortBy === "color" ? "active" : ""}`}
                onClick={() => setSortBy("color")}
              >
                Color
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div className="tm-table-head">
            <span>Tag</span>
            <span>Color</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>

          {/* Tag rows */}
          <div className="tm-tag-list">
            {filteredTags.length === 0 ? (
              <div className="tm-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <p>{filterText ? "No tags match your search" : "No tags yet — create your first one"}</p>
              </div>
            ) : (
              filteredTags.map((tag) => (
                <div key={tag._id} className="tm-tag-row">
                  {/* Tag pill */}
                  <div className="tm-tag-name-col">
                    {editingTag && editingTag._id === tag._id ? (
                      <input
                        type="text"
                        className="tm-inline-input"
                        value={editingTag.name}
                        onChange={(e) =>
                          setEditingTag({ ...editingTag, name: e.target.value })
                        }
                        onBlur={(e) => {
                          if (!e.relatedTarget?.classList.contains("tm-color-input")) {
                            handleUpdateTag(tag, true);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateTag(tag, true);
                          if (e.key === "Escape") setEditingTag(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="tm-tag-pill"
                        style={{
                          background: tag.color,
                          color: getTextColor(tag.color),
                        }}
                        onClick={() => handleTagUsage(tag)}
                      >
                        {tag.name}
                      </span>
                    )}
                  </div>

                  {/* Color swatch */}
                  <div className="tm-tag-color-col">
                    {editingTag && editingTag._id === tag._id ? (
                      <input
                        type="color"
                        className="tm-color-input"
                        value={editingTag.color}
                        onChange={(e) =>
                          setEditingTag({ ...editingTag, color: e.target.value })
                        }
                        onBlur={() => handleUpdateTag(tag, true)}
                      />
                    ) : (
                      <div
                        className="tm-swatch"
                        style={{ background: tag.color }}
                        title={tag.color}
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="tm-tag-actions-col">
                    {editingTag && editingTag._id === tag._id ? (
                      <>
                        <button
                          className="tm-btn tm-btn--save"
                          onClick={() => handleUpdateTag(tag, true)}
                        >
                          Save
                        </button>
                        <button
                          className="tm-btn tm-btn--ghost"
                          onClick={() => setEditingTag(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="tm-btn tm-btn--ghost"
                          onClick={() => setEditingTag(tag)}
                          aria-label={`Edit tag ${tag.name}`}
                        >
                          Edit
                        </button>
                        <button
                          className="tm-btn tm-btn--danger"
                          onClick={() => handleDeleteTag(tag._id)}
                          aria-label={`Delete tag ${tag.name}`}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
