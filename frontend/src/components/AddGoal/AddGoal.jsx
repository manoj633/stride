// AddGoal.jsx
import React, { useState } from "react";
import "./AddGoal.css";
import { useNavigate } from "react-router-dom";
import { tagsProvider, addGoal } from "../../services/dataService";

const AddGoal = ({ tags = tagsProvider() }) => {
  const navigate = useNavigate();
  const [goal, setGoal] = useState({
    title: "",
    description: "",
    category: "Education",
    priority: "Medium",
    dueDate: "",
    completed: false,
    completionPercentage: 0,
    collaborators: [],
    tags: [],
    comments: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create new goal with all required fields
    const newGoal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9), // temporary ID generation
      completed: false,
      completionPercentage: 0,
      collaborators: [],
      comments: [],
      // Ensure tags is an array
      tags: Array.isArray(goal.tags) ? goal.tags : [],
    };

    // Add the new goal
    addGoal(newGoal);

    // Reset form
    setGoal({
      title: "",
      description: "",
      category: "Education",
      priority: "Medium",
      dueDate: "",
      completed: false,
      completionPercentage: 0,
      collaborators: [],
      tags: [],
      comments: [],
    });

    // Navigate to goals list or goal detail page
    navigate("/goals"); // Adjust this path according to your routing setup
  };

  return (
    <div className="add-goal">
      <h2>Add New Goal</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={goal.title}
            onChange={(e) => setGoal({ ...goal, title: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={goal.description}
            onChange={(e) => setGoal({ ...goal, description: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={goal.category}
            onChange={(e) => setGoal({ ...goal, category: e.target.value })}
          >
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Leisure">Leisure</option>
            <option value="Fitness">Fitness</option>
            <option value="Career">Career</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            value={goal.priority}
            onChange={(e) => setGoal({ ...goal, priority: e.target.value })}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={goal.duration?.startDate || ""}
            onChange={(e) =>
              setGoal({
                ...goal,
                duration: {
                  ...goal.duration,
                  startDate: e.target.value,
                },
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={goal.duration?.endDate || ""}
            onChange={(e) =>
              setGoal({
                ...goal,
                duration: {
                  ...goal.duration,
                  endDate: e.target.value,
                },
              })
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tags">Tags:</label>
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
          >
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add Goal</button>
      </form>
    </div>
  );
};

export default AddGoal;
