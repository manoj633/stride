// src/components/TaskCalendar/TaskCalendar.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";

import HeatMap from "./HeatMap.jsx";

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
  const [draggedTask, setDraggedTask] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [view, setView] = useState("weekly");
  const calendarGridRef = useRef(null);

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

  const generateHeatmapData = () => {
    const heatmapData = {};

    // Iterate over the calendarItems to get task counts for each date
    for (const dateStr in calendarItems) {
      if (calendarItems.hasOwnProperty(dateStr)) {
        // Calculate task count for the day (considering only subtasks for now)
        const taskCount = calendarItems[dateStr].filter(
          (item) => item.type === "subtask"
        ).length;

        heatmapData[dateStr] = { value: taskCount };
      }
    }

    return heatmapData;
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowLeft":
        navigateWeek(-1);
        break;
      case "ArrowRight":
        navigateWeek(1);
        break;
    }
  };

  useEffect(() => {
    // event listener for arrow key presses
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]); // Listen for changes to handleKeyDown

  const days = getDaysInWeek(currentDate);

  const calculateDayProgress = (items) => {
    if (
      !items ||
      items.filter((item) => item.type === "subtask").length === 0
    ) {
      return 0; // No items, 0% progress
    }

    const totalItems = items.filter((item) => item.type === "subtask").length;
    const completedItems = items.filter(
      (item) => item.completed && item.type === "subtask"
    ).length;

    return (completedItems / totalItems) * 100;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        {view === "weekly" ? (
          <h1>Weekly Overview</h1>
        ) : (
          <h1>Monthly Overview</h1>
        )}
        <div className="view-switch">
          <button
            onClick={() => setView("weekly")}
            className={view === "weekly" ? "active" : ""}
          >
            Weekly
          </button>
          <button
            onClick={() => setView("monthly")}
            className={view === "monthly" ? "active" : ""}
          >
            Monthly
          </button>
        </div>
        <div className="navigation-buttons">
          <button onClick={() => navigateWeek(-1)} className="nav-button">
            <ChevronLeft />
          </button>
          <button onClick={() => navigateWeek(1)} className="nav-button">
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="calendar-content">
        {view === "weekly" && ( // Conditionally render weekly or monthly view
          <div
            className="calendar-grid"
            ref={calendarGridRef}
            tabIndex={0} // Making the grid focusable
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}

            {days.map((date) => {
              const dateStr = date.toISOString().split("T")[0];
              const dayItems = calendarItems[dateStr] || [];
              const isToday = new Date().toDateString() === date.toDateString();
              const dayProgress = calculateDayProgress(dayItems);

              return (
                <div
                  key={dateStr}
                  className={`calendar-cell ${isToday ? "today" : ""}`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(date)}
                >
                  <div className="date-header">
                    <div className="date-info">
                      <div
                        className="day-progress-circle"
                        style={{ "--progress": `${dayProgress}%` }}
                      >
                        <span className="percentage">
                          {Math.round(dayProgress)}%
                        </span>
                      </div>
                      <div className="date-number">{formatDate(date)}</div>
                    </div>
                  </div>

                  <div className="calendar-task-list">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        className={`task-item type-${item.type} ${
                          isTouchDevice ? "touch-device" : ""
                        }`}
                        data-priority={item.priority.toLowerCase()}
                        style={{
                          backgroundColor: COLORS.find(
                            (c) => c.id === item.color
                          )?.bg,
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
        )}
        {view === "monthly" && <HeatMap data={generateHeatmapData()} />}
      </div>
    </div>
  );
};

export default TaskCalendar;
