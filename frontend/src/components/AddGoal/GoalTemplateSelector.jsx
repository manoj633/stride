import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchGoalTemplates } from "../../store/features/goalTemplates/goalTemplateSlice";

const GoalTemplateSelector = ({ onSelect }) => {
  const dispatch = useAppDispatch();
  const {
    items: templates,
    loading,
    error,
  } = useAppSelector((state) => state.goalTemplates);

  useEffect(() => {
    dispatch(fetchGoalTemplates());
  }, [dispatch]);

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div>Error loading templates: {error}</div>;
  if (!templates.length) return <div>No templates available.</div>;

  return (
    <div className="form-group">
      <label htmlFor="goal-template-select">Choose a template:</label>
      <select
        id="goal-template-select"
        className="goal-template-select"
        onChange={(e) => {
          const selectedId = e.target.value;
          const selected = templates.find((t) => t._id === selectedId);
          if (selected) onSelect(selected);
        }}
        defaultValue=""
      >
        <option value="">-- Select a template (optional) --</option>
        {templates.map((template) => (
          <option key={template._id} value={template._id}>
            {template.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GoalTemplateSelector;
