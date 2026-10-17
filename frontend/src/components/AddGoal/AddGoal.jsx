// AddGoal.jsx
import React, { useEffect, useState, useMemo } from "react";
import "./AddGoal.css";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createGoal } from "../../store/features/goals/goalSlice";
import { fetchTags } from "../../store/features/tags/tagSlice";
import { toast } from "react-toastify";
import GoalTemplateSelector from "./GoalTemplateSelector";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import { useUnsavedChanges } from "../Common/useUnsavedChanges";

const getCurrentMonthDateRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { startDate, endDate };
};

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

const AddGoal = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const defaultDates = useMemo(() => getCurrentMonthDateRange(), []);

  const tags = useAppSelector((state) => state.tags.items);
  const loading = useAppSelector((state) => state.tags.loading);
  const error = useAppSelector((state) => state.tags.error);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  const [goal, setGoal] = useState({
    title: "",
    description: "",
    category: "Education",
    priority: "Medium",
    duration: {
      startDate: defaultDates.startDate,
      endDate: defaultDates.endDate,
    },
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagToggle = (tagId) => {
    setGoal((prev) => {
      const isSelected = prev.tags.some(
        (t) => (typeof t === "object" ? t._id === tagId : t === tagId)
      );
      const nextTags = isSelected
        ? prev.tags.filter((t) => (typeof t === "object" ? t._id !== tagId : t !== tagId))
        : [...prev.tags, tagId];
      return { ...prev, tags: nextTags };
    });
  };

  const isDirty =
    !isSubmitting &&
    (Boolean(goal.title.trim()) ||
      Boolean(goal.description.trim()) ||
      goal.duration.startDate !== defaultDates.startDate ||
      goal.duration.endDate !== defaultDates.endDate ||
      goal.tags.length > 0);

  useUnsavedChanges(isDirty, {
    title: "Discard New Goal?",
    message:
      "You have entered details for a new goal. If you leave this page, your progress will be lost.",
    confirmText: "Leave Page",
    cancelText: "Keep Editing",
  });

  const handleTemplateSelect = (template) => {
    setGoal({
      title: template.title || "",
      description: template.description || "",
      category: template.category || "Education",
      priority: template.priority || "Medium",
      duration: {
        startDate: defaultDates.startDate,
        endDate: defaultDates.endDate,
      },
      tags: template.tags || [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const newGoal = {
      ...goal,
      completed: false,
      completionPercentage: 0,
      collaborators: [],
      comments: [],
      tags: Array.isArray(goal.tags) ? goal.tags : [],
    };

    try {
      await toast.promise(dispatch(createGoal(newGoal)).unwrap(), {
        pending: "Creating your goal...",
        success: "Goal created successfully!",
        error: "Failed to create goal",
      });

      setGoal({
        title: "",
        description: "",
        category: "Education",
        priority: "Medium",
        duration: { startDate: defaultDates.startDate, endDate: defaultDates.endDate },
        tags: [],
      });

      navigate("/goals");
    } catch (error) {
      console.error("Failed to create goal:", error);
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading tags..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="add-goal-container">
      {/* Top bar */}
      <div className="ef-topbar">
        <div className="ef-topbar__icon">G</div>
        <span className="ef-topbar__title">Goals</span>
        <span className="ef-topbar__breadcrumb">
          / <span>New Goal</span>
        </span>
        <button
          className="ef-topbar__back"
          onClick={() => navigate("/goals")}
          type="button"
        >
          ← Back to Goals
        </button>
      </div>

      {/* Scrollable body */}
      <div className="ef-body">
        <div className="add-goal">
          {/* Card header */}
          <div className="ef-form-header">
            <h2>Create a new Goal</h2>
            <p>Define your objective, set a timeframe and track progress.</p>
          </div>

          {/* Template selector (kept as-is) */}
          <div style={{ padding: "16px 32px 0" }}>
            <GoalTemplateSelector onSelect={handleTemplateSelect} />
          </div>

          {/* Form fields */}
          <form onSubmit={handleSubmit}>
            <div className="ef-form-body">
              <div className="form-group">
                <label htmlFor="title">Goal Title</label>
                <input
                  type="text"
                  id="title"
                  value={goal.title}
                  onChange={(e) => setGoal({ ...goal, title: e.target.value })}
                  required
                  placeholder="e.g. Conquer Mount Everest"
                  aria-label="Goal title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={goal.description}
                  onChange={(e) =>
                    setGoal({ ...goal, description: e.target.value })
                  }
                  required
                  placeholder="Describe what achieving this goal means to you..."
                  aria-label="Goal description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={goal.category}
                    onChange={(e) =>
                      setGoal({ ...goal, category: e.target.value })
                    }
                    aria-label="Goal category"
                  >
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Leisure">Leisure</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Career">Career</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={goal.priority}
                    onChange={(e) =>
                      setGoal({ ...goal, priority: e.target.value })
                    }
                    aria-label="Goal priority"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={goal.duration?.startDate || ""}
                    onChange={(e) =>
                      setGoal({
                        ...goal,
                        duration: { ...goal.duration, startDate: e.target.value },
                      })
                    }
                    required
                    aria-label="Goal start date"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    min={goal.duration?.startDate || ""}
                    value={goal.duration?.endDate || ""}
                    onChange={(e) =>
                      setGoal({
                        ...goal,
                        duration: { ...goal.duration, endDate: e.target.value },
                      })
                    }
                    required
                    aria-label="Goal end date"
                  />
                </div>
              </div>

              {tags.length > 0 && (
                <div className="form-group ef-tags-group">
                  <div className="ef-tags-header">
                    <label>Tags</label>
                    {goal.tags.length > 0 && (
                      <span className="ef-tags-count">
                        {goal.tags.length} selected
                        <button
                          type="button"
                          className="ef-tags-clear-btn"
                          onClick={() => setGoal((prev) => ({ ...prev, tags: [] }))}
                          aria-label="Clear selected tags"
                        >
                          Clear
                        </button>
                      </span>
                    )}
                  </div>
                  <div className="ef-tags-picker" role="group" aria-label="Select tags">
                    {tags.map((tag) => {
                      const isSelected = goal.tags.some(
                        (t) => (typeof t === "object" ? t._id === tag._id : t === tag._id)
                      );
                      const textColor = getTagTextColor(tag.color);

                      return (
                        <button
                          key={tag._id}
                          type="button"
                          className={`ef-tag-chip ${isSelected ? "selected" : ""}`}
                          onClick={() => handleTagToggle(tag._id)}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: tag.color,
                                  color: textColor,
                                  borderColor: tag.color,
                                  boxShadow: `0 2px 6px ${tag.color}40`,
                                }
                              : {
                                  borderColor: `${tag.color}70`,
                                }
                          }
                          aria-pressed={isSelected}
                          title={isSelected ? `Deselect ${tag.name}` : `Select ${tag.name}`}
                        >
                          <span
                            className="ef-tag-chip__dot"
                            style={{
                              backgroundColor: isSelected ? textColor : tag.color,
                            }}
                          />
                          <span className="ef-tag-chip__name">{tag.name}</span>
                          {isSelected ? (
                            <span className="ef-tag-chip__check" aria-hidden="true">
                              ✓
                            </span>
                          ) : (
                            <span className="ef-tag-chip__plus" aria-hidden="true">
                              +
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="ef-submit-btn"
                disabled={isSubmitting}
                aria-label="Add new goal"
              >
                {isSubmitting ? "Creating Goal..." : "Create Goal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGoal;
