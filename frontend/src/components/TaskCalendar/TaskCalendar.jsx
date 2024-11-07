// src/components/TaskCalendar/TaskCalendar.jsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  goalsProvider,
  tasksProvider,
  subtasksProvider,
  updateSubtaskCompletionStatus,
  updateGoalCompletionStatus,
} from "../../services/dataService";
import "./TaskCalendar.css";

const COLORS = [
  { id: "high", bg: "#ffe6e6", label: "High Priority" },
  { id: "medium", bg: "#fff8e6", label: "Medium Priority" },
  { id: "low", bg: "#e6f8e6", label: "Low Priority" },
  { id: "default", bg: "transparent", label: "Default" },
];

const TaskCalendar = () => {
  const navigate = useNavigate();
  const [calendarItems, setCalendarItems] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    const goals = goalsProvider();
    const tasks = tasksProvider();
    const subtasks = subtasksProvider();

    const itemsByDate = {};

    goals.forEach((goal) => {
      const dateStr = new Date(goal.duration.startDate)
        .toISOString()
        .split("T")[0];
      if (!itemsByDate[dateStr]) itemsByDate[dateStr] = [];
      itemsByDate[dateStr].push({
        id: `goal-${goal.id}`,
        text: goal.title,
        type: "goal",
        priority: goal.priority,
        completed: goal.completed,
        color: goal.priority.toLowerCase(),
        originalItem: goal,
      });
    });

    tasks.forEach((task) => {
      const dateStr = new Date(task.startDate).toISOString().split("T")[0];
      if (!itemsByDate[dateStr]) itemsByDate[dateStr] = [];
      itemsByDate[dateStr].push({
        id: `task-${task.id}`,
        text: task.name,
        type: "task",
        priority: task.priority,
        completed: task.completed,
        color: task.priority.toLowerCase(),
        originalItem: task,
      });
    });

    subtasks.forEach((subtask) => {
      const dateStr = new Date(subtask.dueDate).toISOString().split("T")[0];
      if (!itemsByDate[dateStr]) itemsByDate[dateStr] = [];
      itemsByDate[dateStr].push({
        id: `subtask-${subtask.id}`,
        text: subtask.name,
        type: "subtask",
        priority: subtask.priority,
        completed: subtask.completed,
        color: subtask.priority.toLowerCase(),
        originalItem: subtask,
      });
    });

    setCalendarItems(itemsByDate);
  }, []);

  // src/components/TaskCalendar/TaskCalendar.jsx

  const toggleItem = (date, item) => {
    const [type, id] = item.id.split("-");

    // Update the completion status based on item type
    switch (type) {
      case "goal":
        updateGoalCompletionStatus(id, !item.completed); // Call your data service function
        break;
      case "task":
        updateTaskCompletionStatus(id, !item.completed); // Call your data service function
        break;
      case "subtask":
        updateSubtaskCompletionStatus(id, !item.completed);
        break;
      default:
        console.warn("Unknown item type:", type);
    }

    // Update local state
    const dateStr = date.toISOString().split("T")[0];
    setCalendarItems((prev) => ({
      ...prev,
      [dateStr]: prev[dateStr].map((i) =>
        i.id === item.id ? { ...i, completed: !i.completed } : i
      ),
    }));
  };

  const getDaysInWeek = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDate = (date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const handleItemClick = (item) => {
    const [type, id] = item.id.split("-");
    switch (type) {
      case "goal":
        navigate(`/goals/${id}`);
        break;
      case "task":
        navigate(`/tasks/${id}`);
        break;
      case "subtask":
        navigate(`/subtasks/${id}`);
        break;
    }
  };

  const handleDragStart = (date, item) => {
    setDraggedTask({ item, fromDate: date });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (toDate) => {
    if (!draggedTask) return;

    const fromDateStr = draggedTask.fromDate.toISOString().split("T")[0];
    const toDateStr = toDate.toISOString().split("T")[0];

    if (fromDateStr === toDateStr) return;

    setCalendarItems((prev) => ({
      ...prev,
      [fromDateStr]: prev[fromDateStr].filter(
        (item) => item.id !== draggedTask.item.id
      ),
      [toDateStr]: [...(prev[toDateStr] || []), draggedTask.item],
    }));

    setDraggedTask(null);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const days = getDaysInWeek(currentDate);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Weekly Overview</h1>
        <div className="navigation-buttons">
          <button onClick={() => navigateWeek(-1)} className="nav-button">
            <ChevronLeft />
          </button>
          <button onClick={() => navigateWeek(1)} className="nav-button">
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}

        {days.map((date) => {
          const dateStr = date.toISOString().split("T")[0];
          const dayItems = calendarItems[dateStr] || [];
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={dateStr}
              className={`calendar-cell ${isToday ? "today" : ""}`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(date)}
            >
              <div className="date-header">
                <div className="date-info">
                  <span className="date-number">{formatDate(date)}</span>
                </div>
              </div>

              <div className="task-list">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className={`task-item ${item.type}-item`}
                    style={{
                      backgroundColor: COLORS.find((c) => c.id === item.color)
                        ?.bg,
                    }}
                    onClick={() => handleItemClick(item)}
                    draggable
                    onDragStart={() => handleDragStart(date, item)}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      className="task-checkbox"
                      onChange={() => toggleItem(date, item)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <span
                      className={`task-text ${
                        item.completed ? "completed" : ""
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskCalendar;
