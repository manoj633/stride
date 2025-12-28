// src/components/TaskCalendar/TaskCalendar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import HeatMap from "./HeatMap.jsx";
import DayPopover from "./DayPopover";
import {
  fetchGoals,
  setSelectedGoal,
  updateGoalCompletion,
} from "../../store/features/goals/goalSlice";
import {
  fetchTasks,
  setSelectedTask,
  updateTaskCompletion,
} from "../../store/features/tasks/taskSlice";
import {
  fetchSubtasks,
  setSelectedSubtask,
  updateSubtask,
} from "../../store/features/subtasks/subtaskSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import "./TaskCalendar.css";

const COLORS = [
  { id: "high", bg: "#ffe6e6", label: "High Priority" },
  { id: "medium", bg: "#fff8e6", label: "Medium Priority" },
  { id: "low", bg: "#e6f8e6", label: "Low Priority" },
  { id: "default", bg: "transparent", label: "Default" },
];

// Helper functions
const addItemToCalendar = (
  itemsByDate,
  item,
  startDate,
  endDate = startDate
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    const dateStr = date.toISOString().split("T")[0];
    if (!itemsByDate[dateStr]) itemsByDate[dateStr] = [];
    itemsByDate[dateStr].push(item);
  }
};

const getDaysInWeek = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
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

const calculateDayProgress = (items) => {
  const subtasks = items?.filter((item) => item.type === "subtask") || [];
  if (subtasks.length === 0) return 0;
  const completed = subtasks.filter((item) => item.completed).length;
  return (completed / subtasks.length) * 100;
};

// Helper to get all days in a month as Date objects
const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Helper to get the first day of the week for the month (for grid alignment)
const getFirstDayOfWeek = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// Helper to get the last day of the week for the month (for grid alignment)
const getLastDayOfWeek = (year, month) => {
  return new Date(year, month + 1, 0).getDay();
};

const TaskCalendar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { userInfo } = useAppSelector((state) => state.user);
  const goals = useAppSelector((state) => state.goals.items);
  const tasks = useAppSelector((state) => state.tasks.items);
  const subtasks = useAppSelector((state) => state.subtasks.items);

  const [calendarItems, setCalendarItems] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [view, setView] = useState("weekly");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedType, setSelectedType] = useState("subtask");
  const [showCompleted, setShowCompleted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for month/year in monthly view
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [heatmapScale, setHeatmapScale] = useState([
    { max: 0, color: "#f8f9fa" }, // 0 tasks
    { max: 2, color: "#b3ffb3" }, // 1-2 tasks
    { max: 4, color: "#ffd699" }, // 3-4 tasks
    { max: 6, color: "#ffb3b3" }, // 5-6 tasks
    { max: Infinity, color: "#ff8080" }, // 7+ tasks
  ]);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window);
  }, []);

  // Fetch data if not loaded
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (goals.length === 0) await dispatch(fetchGoals());
        if (tasks.length === 0) await dispatch(fetchTasks());
        if (subtasks.length === 0) await dispatch(fetchSubtasks());
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch, goals.length, tasks.length, subtasks.length]);

  // Build calendar items
  useEffect(() => {
    const itemsByDate = {};
    goals.forEach((goal) => {
      addItemToCalendar(
        itemsByDate,
        {
          id: `goal-${goal._id}`,
          text: goal.title,
          type: "goal",
          priority: goal.priority,
          completed: goal.completed,
          color: goal.priority.toLowerCase(),
          originalItem: goal,
        },
        goal.duration.startDate,
        goal.duration.endDate
      );
    });
    tasks.forEach((task) => {
      addItemToCalendar(
        itemsByDate,
        {
          id: `task-${task._id}`,
          text: task.name,
          type: "task",
          priority: task.priority,
          completed: task.completed,
          color: task.priority.toLowerCase(),
          originalItem: task,
        },
        task.startDate,
        task.endDate
      );
    });
    subtasks.forEach((subtask) => {
      addItemToCalendar(
        itemsByDate,
        {
          id: `subtask-${subtask._id}`,
          text: subtask.name,
          type: "subtask",
          priority: subtask.priority,
          completed: subtask.completed,
          color: subtask.priority.toLowerCase(),
          originalItem: subtask,
        },
        subtask.dueDate
      );
    });
    setCalendarItems(itemsByDate);
  }, [goals, tasks, subtasks]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userInfo) navigate("/login");
  }, [userInfo, navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") navigateWeek(-1);
      if (e.key === "ArrowRight") navigateWeek(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentDate]);

  // Memoized days and filtered items
  const days = useMemo(() => getDaysInWeek(currentDate), [currentDate]);
  const filteredItems = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(calendarItems).map(([date, items]) => [
          date,
          items.filter((item) => {
            const matchesPriority =
              selectedPriority === "all" ||
              item.priority.toLowerCase() === selectedPriority;
            const matchesType =
              selectedType === "all" || item.type === selectedType;
            const matchesCompletion = showCompleted || !item.completed;
            return matchesPriority && matchesType && matchesCompletion;
          }),
        ])
      ),
    [calendarItems, selectedPriority, selectedType, showCompleted]
  );

  // Memoized heatmap data
  const heatmapData = useMemo(() => {
    const data = {};
    for (const dateStr in calendarItems) {
      if (calendarItems.hasOwnProperty(dateStr)) {
        const taskCount = calendarItems[dateStr].filter(
          (item) => item.type === "subtask"
        ).length;
        data[dateStr] = { value: taskCount };
      }
    }
    return data;
  }, [calendarItems]);

  // Navigation
  const navigateWeek = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction * 7);
      return newDate;
    });
  };

  const handlePrevMonth = () => {
    setMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };
  const handleNextMonth = () => {
    setMonthDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const month = monthDate.getMonth();
  const year = monthDate.getFullYear();
  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const lastDayOfWeek = getLastDayOfWeek(year, month);

  // Item click handler
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
      default:
        break;
    }
  };

  // Progress color generator
  const getProgressColor = (progress) => {
    if (progress === 0) return "#ff4d4f"; // red
    if (progress < 35) return "#ff7a00"; // orange
    if (progress < 75) return "#fadb14"; // yellow
    if (progress < 100) return "#73d13d"; // light green
    return "#22c55e"; // bright green (100%)
  };

  const getDisplayProgress = (progress) => {
    if (progress === 0) return 100; // FULL ring
    return progress;
  };

  // Drag and drop handlers
  const handleDragStart = (date, item) =>
    setDraggedTask({ item, fromDate: date });
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (toDate) => {
    if (!draggedTask) return;
    const fromDateStr = draggedTask.fromDate.toISOString().split("T")[0];
    const toDateStr = toDate.toISOString().split("T")[0];
    if (fromDateStr === toDateStr) return;
    const updatedItem = {
      ...draggedTask.item.originalItem,
      dueDate: toDateStr,
    };
    switch (draggedTask.item.type) {
      case "goal":
        dispatch(
          updateGoalCompletion({
            goalId: updatedItem._id,
            goalData: updatedItem,
          })
        )
          .then(() => {
            setCalendarItems((prev) => ({
              ...prev,
              [fromDateStr]: prev[fromDateStr].filter(
                (item) => item.id !== draggedTask.item.id
              ),
              [toDateStr]: [...(prev[toDateStr] || []), draggedTask.item],
            }));
          })
          .catch((error) => {
            console.error("Failed to update goal:", error);
          });
        break;
      case "task":
        dispatch(
          updateTaskCompletion({
            taskId: updatedItem._id,
            taskData: updatedItem,
          })
        )
          .then(() => {
            setCalendarItems((prev) => ({
              ...prev,
              [fromDateStr]: prev[fromDateStr].filter(
                (item) => item.id !== draggedTask.item.id
              ),
              [toDateStr]: [...(prev[toDateStr] || []), draggedTask.item],
            }));
          })
          .catch((error) => {
            console.error("Failed to update task:", error);
          });
        break;
      case "subtask":
        dispatch(
          updateSubtask({
            subtaskId: updatedItem._id,
            subtaskData: updatedItem,
          })
        )
          .then(() => {
            setCalendarItems((prev) => ({
              ...prev,
              [fromDateStr]: prev[fromDateStr].filter(
                (item) => item.id !== draggedTask.item.id
              ),
              [toDateStr]: [...(prev[toDateStr] || []), draggedTask.item],
            }));
          })
          .catch((error) => {
            console.error("Failed to update subtask:", error);
          });
        break;
      default:
        break;
    }
    setDraggedTask(null);
  };

  // Toggle completion
  const toggleItem = (date, item) => {
    const [type, id] = item.id.split("-");
    switch (type) {
      case "subtask":
        const updatedSubtask = {
          ...item.originalItem,
          completed: !item.originalItem.completed,
        };
        dispatch(updateSubtask({ id, subtaskData: updatedSubtask }))
          .then(() => {
            if (item.originalItem.taskId) {
              dispatch(
                updateTaskCompletion({
                  taskId: item.originalItem.taskId,
                  subtasks,
                })
              ).then(() => {
                if (item.originalItem.goalId) {
                  dispatch(
                    updateGoalCompletion({
                      goalId: item.originalItem.goalId,
                      subtasks,
                    })
                  )
                    .then(() => toast.success("Subtask updated successfully"))
                    .catch((error) =>
                      console.error("Failed to update goal completion:", error)
                    );
                }
              });
            }
          })
          .catch((error) => {
            console.error("Failed to update subtask:", error);
            toast.error("Failed to update subtask");
          });
        break;
      default:
        break;
    }
    const dateStr = date.toISOString().split("T")[0];
    setCalendarItems((prev) => ({
      ...prev,
      [dateStr]: prev[dateStr].map((i) =>
        i.id === item.id ? { ...i, completed: !i.completed } : i
      ),
    }));
  };

  // Early return for loading
  if (isLoading) return <LoadingSpinner message="Loading calendar..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>{view === "weekly" ? "Weekly Overview" : "Monthly Overview"}</h1>
        <div className="view-switch">
          <button
            onClick={() => setView("weekly")}
            className={view === "weekly" ? "active" : ""}
            aria-label="Switch to weekly view"
          >
            Weekly
          </button>
          <button
            onClick={() => setView("monthly")}
            className={view === "monthly" ? "active" : ""}
            aria-label="Switch to monthly view"
          >
            Monthly
          </button>
        </div>
        {view === "monthly" && (
          <div className="navigation-buttons">
            <button onClick={handlePrevMonth} aria-label="Previous month">
              <ChevronLeft />
            </button>
            <span style={{ margin: "0 1rem" }}>
              {monthDate.toLocaleString("default", { month: "long" })} {year}
            </span>
            <button onClick={handleNextMonth} aria-label="Next month">
              <ChevronRight />
            </button>
          </div>
        )}
        {view === "weekly" && (
          <div className="navigation-buttons">
            <button onClick={() => navigateWeek(-1)} aria-label="Previous week">
              <ChevronLeft />
            </button>
            <button onClick={() => navigateWeek(1)} aria-label="Next week">
              <ChevronRight />
            </button>
          </div>
        )}
      </div>

      <div className="calendar-filters">
        <div className="filter-group">
          <label htmlFor="priority-select">Priority:</label>
          <select
            id="priority-select"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="type-select">Type:</label>
          <select
            id="type-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="goal">Goals</option>
            <option value="task">Tasks</option>
            <option value="subtask">Subtasks</option>
          </select>
        </div>
        <div className="filter-group">
          <input
            type="checkbox"
            id="show-completed"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          <label htmlFor="show-completed">Show Completed</label>
        </div>
      </div>

      <div className="calendar-content">
        {view === "weekly" ? (
          <div className="calendar-grid" tabIndex={0}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}
            {days.map((date) => {
              const dateStr = date.toISOString().split("T")[0];
              const dayItems = filteredItems[dateStr] || [];
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
                        className={`day-progress-circle ${
                          dayProgress === 0 ? "pulse" : ""
                        }`}
                        style={{
                          "--progress": `${getDisplayProgress(dayProgress)}%`,
                          "--progress-color": getProgressColor(dayProgress),
                        }}
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
                        onClick={() => handleItemClick(item)}
                        draggable={!isTouchDevice}
                        onDragStart={() =>
                          !isTouchDevice && handleDragStart(date, item)
                        }
                        aria-label={`${item.type} ${item.text}`}
                      >
                        {item.type === "subtask" && (
                          <input
                            type="checkbox"
                            checked={item.completed}
                            className="task-checkbox"
                            onChange={() => toggleItem(date, item)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Toggle completion"
                          />
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
        ) : (
          // Monthly Heatmap View
          <div className="monthly-heatmap">
            <div className="calendar-grid month">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="day-header">
                  {day}
                </div>
              ))}
              {/* Empty cells before the first day */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div
                  key={`empty-start-${i}`}
                  className="calendar-cell empty"
                ></div>
              ))}
              {/* Days of the month */}
              {daysInMonth.map((date) => {
                const dateStr = date.toISOString().split("T")[0];
                const count = (filteredItems[dateStr] || []).filter(
                  (item) => item.type === "subtask"
                ).length;
                const isToday =
                  new Date().toDateString() === date.toDateString();
                const items = filteredItems[dateStr] || [];

                // Find the scale/color for this count
                const scaleIdx = heatmapScale.findIndex(
                  (level) => count <= level.max
                );
                const cellColor = heatmapScale[scaleIdx]?.color || "#f8f9fa";

                return (
                  <div
                    key={dateStr}
                    className={`heatmap-cell ${isToday ? "today" : ""}`}
                    title={`${formatDate(date)}: ${count} subtasks`}
                    onClick={() => setSelectedDay({ date, items })}
                    style={{ cursor: "pointer", background: cellColor }}
                  >
                    <div className="heatmap-date-container">
                      <span className="heatmap-date">{date.getDate()}</span>
                      {count > 0 && (
                        <span className="heatmap-badge">{count}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Empty cells after the last day */}
              {Array.from({ length: 6 - lastDayOfWeek }).map((_, i) => (
                <div
                  key={`empty-end-${i}`}
                  className="calendar-cell empty"
                ></div>
              ))}
            </div>
            {/* Legend */}
            <div className="heatmap-legend">
              {heatmapScale.map((level, idx) => (
                <div className="legend-item" key={idx}>
                  <span
                    className="legend-swatch"
                    style={{ background: level.color }}
                  ></span>
                  <span className="legend-label">
                    {idx === 0
                      ? `0`
                      : `${heatmapScale[idx - 1].max + 1}-${
                          level.max === Infinity ? "+" : level.max
                        }`}{" "}
                    tasks
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {selectedDay && (
        <DayPopover
          date={selectedDay.date}
          items={selectedDay.items}
          onClose={() => setSelectedDay(null)}
        />
      )}
      {view === "monthly" && (
        <div className="heatmap-scale-editor">
          <span style={{ fontWeight: 500, marginRight: 8 }}>
            Customize Heatmap:
          </span>
          {heatmapScale.map((level, idx) => (
            <span key={idx} style={{ marginRight: 12 }}>
              <input
                type="number"
                min={idx === 0 ? 0 : heatmapScale[idx - 1].max + 1}
                max={
                  idx < heatmapScale.length - 1 ? heatmapScale[idx + 1].max : 99
                }
                value={level.max === Infinity ? "" : level.max}
                onChange={(e) => {
                  const val =
                    e.target.value === ""
                      ? Infinity
                      : parseInt(e.target.value, 10);
                  setHeatmapScale((scale) =>
                    scale.map((l, i) => (i === idx ? { ...l, max: val } : l))
                  );
                }}
                style={{
                  width: 40,
                  marginRight: 4,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: "2px 4px",
                }}
                disabled={idx === heatmapScale.length - 1}
              />
              <input
                type="color"
                value={level.color}
                onChange={(e) => {
                  setHeatmapScale((scale) =>
                    scale.map((l, i) =>
                      i === idx ? { ...l, color: e.target.value } : l
                    )
                  );
                }}
                style={{
                  width: 28,
                  height: 18,
                  border: "none",
                  verticalAlign: "middle",
                }}
              />
              {idx < heatmapScale.length - 1 && (
                <span style={{ fontSize: 12, color: "#888", marginLeft: 2 }}>
                  to
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;
