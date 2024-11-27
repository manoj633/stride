// src/components/TaskCalendar/TaskCalendar.jsx
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";

// Import the slice actions
import {
  fetchGoals,
  setSelectedGoal,
} from "../../store/features/goals/goalSlice";
import {
  fetchTasks,
  setSelectedTask,
} from "../../store/features/tasks/taskSlice";
import {
  fetchSubtasks,
  setSelectedSubtask,
  markSubtaskComplete,
} from "../../store/features/subtasks/subtaskSlice";

import "./TaskCalendar.css";

const COLORS = [
  { id: "high", bg: "#ffe6e6", label: "High Priority" },
  { id: "medium", bg: "#fff8e6", label: "Medium Priority" },
  { id: "low", bg: "#e6f8e6", label: "Low Priority" },
  { id: "default", bg: "transparent", label: "Default" },
];

const TaskCalendar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const goals = useAppSelector((state) => state.goals.items);
  const tasks = useAppSelector((state) => state.tasks.items);
  const subtasks = useAppSelector((state) => state.subtasks.items);

  const [calendarItems, setCalendarItems] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window);
  }, []);

  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTasks());
    dispatch(fetchSubtasks());
  }, [dispatch]);

  useEffect(() => {
    const itemsByDate = {};

    goals.forEach((goal) => {
      // Create start and end dates
      const startDate = new Date(goal.duration.startDate);
      const endDate = new Date(goal.duration.endDate);

      // Loop through each day between start and end
      for (
        let date = startDate;
        date <= endDate;
        date = new Date(date.setDate(date.getDate() + 1))
      ) {
        const dateStr = date.toISOString().split("T")[0];
        if (!itemsByDate[dateStr]) itemsByDate[dateStr] = [];
        itemsByDate[dateStr].push({
          id: `goal-${goal._id}`,
          text: goal.title,
          type: "goal",
          priority: goal.priority,
          completed: goal.completed,
          color: goal.priority.toLowerCase(),
          originalItem: goal,
        });
      }
    });

    tasks.forEach((task) => {
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);

      // Create array of dates between start and end
      for (
        let date = startDate;
        date <= endDate;
        date = new Date(date.setDate(date.getDate() + 1))
      ) {
        const dateStr = date.toISOString().split("T")[0];

        if (!itemsByDate[dateStr]) itemsByDate[dateStr] = [];
        itemsByDate[dateStr].push({
          id: `task-${task._id}`,
          text: task.name,
          type: "task",
          priority: task.priority,
          completed: task.completed,
          color: task.priority.toLowerCase(),
          originalItem: task,
        });
      }
    });

    subtasks.forEach((subtask) => {
      const dateStr = new Date(subtask.dueDate).toISOString().split("T")[0];
      if (!itemsByDate[dateStr]) itemsByDate[dateStr] = [];
      itemsByDate[dateStr].push({
        id: `subtask-${subtask._id}`,
        text: subtask.name,
        type: "subtask",
        priority: subtask.priority,
        completed: subtask.completed,
        color: subtask.priority.toLowerCase(),
        originalItem: subtask,
      });
    });

    setCalendarItems(itemsByDate);
  }, [goals, tasks, subtasks]);

  const toggleItem = (date, item) => {
    const [type, id] = item.id.split("-");

    // Update the completion status based on item type
    switch (type) {
      case "subtask":
        dispatch(markSubtaskComplete({ id }));
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
        dispatch(setSelectedGoal(item.originalItem));
        navigate(`/goals/${id}`);
        break;
      case "task":
        dispatch(setSelectedTask(item.originalItem));
        navigate(`/tasks/${id}`);
        break;
      case "subtask":
        dispatch(setSelectedSubtask(item.originalItem));
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
                    className={`task-item ${item.type}-item ${
                      isTouchDevice ? "touch-device" : ""
                    }`}
                    style={{
                      backgroundColor: COLORS.find((c) => c.id === item.color)
                        ?.bg,
                    }}
                    onClick={() => isTouchDevice && handleItemClick(item)}
                    draggable={!isTouchDevice}
                    onDragStart={() =>
                      !isTouchDevice && handleDragStart(date, item)
                    }
                  >
                    {item.type === "subtask" ? (
                      <input
                        type="checkbox"
                        checked={item.completed}
                        className="task-checkbox"
                        onChange={() => toggleItem(date, item)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      ""
                    )}

                    <span
                      className={`task-text ${
                        item.completed ? "completed" : ""
                      }`}
                    >
                      {item.type.toUpperCase()} - {item.text}
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
