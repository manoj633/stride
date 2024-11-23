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

export const TagManager = () => {
  const dispatch = useAppDispatch();
  const { items: tags, loading, error } = useAppSelector((state) => state.tags);
  const [newTag, setNewTag] = useState({ name: "", color: "#ffb3ba" });
  const [editingTag, setEditingTag] = useState(null);

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
    if (window.confirm("Are you sure you want to delete this tag?")) {
      dispatch(deleteTag(tagId));
    }
  };

  if (loading) return <div className="tag-manager__loading">Loading...</div>;
  if (error) return <div className="tag-manager__error">{error}</div>;

  return (
    <div className="tag-manager">
      <form className="tag-manager__form" onSubmit={handleCreateTag}>
        <div className="tag-manager__input-group">
          <input
            type="text"
            className="tag-manager__input"
            placeholder="Enter new tag name"
            value={newTag.name}
            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
          />
          <input
            type="color"
            className="tag-manager__color-picker"
            value={newTag.color}
            onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
          />
        </div>
        <button
          type="submit"
          className="tag-manager__button tag-manager__button--create"
          disabled={!newTag.name.trim()}
        >
          Add Tag
        </button>
      </form>

      <div className="tag-manager__list">
        {tags.map((tag) => (
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
                    // Only update if the click is not on the color picker
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
