// AddGoal.jsx
import React, { useEffect, useState } from "react";
import "./AddGoal.css";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createGoal } from "../../store/features/goals/goalSlice";
import { fetchTags } from "../../store/features/tags/tagSlice";
import { toast } from "react-toastify";
import GoalTemplateSelector from "./GoalTemplateSelector";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

const AddGoal = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
      startDate: "",
      endDate: "",
    },
    tags: [],
  });

  const handleTemplateSelect = (template) => {
    setGoal({
      title: template.title || "",
      description: template.description || "",
      category: template.category || "Education",
      priority: template.priority || "Medium",
      duration: {
        startDate: template.duration?.startDate
          ? template.duration.startDate.slice(0, 10)
          : "",
        endDate: template.duration?.endDate
          ? template.duration.endDate.slice(0, 10)
          : "",
      },
      tags: template.tags || [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newGoal = {
      ...goal,
      completed: false,
      completionPercentage: 0,
      collaborators: [],
      comments: [],
      tags: Array.isArray(goal.tags) ? goal.tags : [],
    };

    try {
      toast.promise(dispatch(createGoal(goal)).unwrap(), {
        pending: "Creating your goal...",
        success: "Goal created successfully!",
        error: "Failed to create goal",
      });

      setGoal({
        title: "",
        description: "",
        category: "Education",
        priority: "Medium",
        duration: { startDate: "", endDate: "" },
        tags: [],
      });

      navigate("/goals");
    } catch (error) {
      console.error("Failed to create goal:", error);
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
                <div className="form-group">
                  <label htmlFor="tags">Tags</label>
                  <select
                    multiple
                    id="tags"
                    value={goal.tags}
                    onChange={(e) =>
                      setGoal({
                        ...goal,
                        tags: Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        ),
                      })
                    }
                    aria-label="Goal tags"
                  >
                    {tags.map((tag) => (
                      <option key={tag._id} value={tag._id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" className="ef-submit-btn" aria-label="Add new goal">
                Create Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGoal;
