// src/components/TaskCalendar/TaskCalendar.jsx
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
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

const PRIORITY_COLORS = {
  high: "high",
  medium: "medium",
  low: "low",
  default: "default",
};

// Helper: Add item to calendar across date range
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

// Helper: Get 7 days starting from Sunday of the week
const getDaysInWeek = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
};

// Helper: Format date as "Jan 28"
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

// Helper: Calculate completion percentage for a day
const calculateDayProgress = (items) => {
  const subtasks = items?.filter((item) => item.type === "subtask") || [];
  if (subtasks.length === 0) return 0;
  const completed = subtasks.filter((item) => item.completed).length;
  return (completed / subtasks.length) * 100;
};

// Helper: Get all days in a month
const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Helper: Get first day of week offset
const getFirstDayOfWeek = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// Helper: Get last day of week offset
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
  const [selectedType, setSelectedType] = useState("all");
  const [showCompleted, setShowCompleted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [heatmapScale, setHeatmapScale] = useState([
    { max: 0, color: "#f8f9fa" },
    { max: 2, color: "#d1fae5" },
    { max: 4, color: "#fef3c7" },
    { max: 6, color: "#fed7aa" },
    { max: Infinity, color: "#fca5a5" },
  ]);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (goals.length === 0) await dispatch(fetchGoals());
        if (tasks.length === 0) await dispatch(fetchTasks());
        if (subtasks.length === 0) await dispatch(fetchSubtasks());
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch, goals.length, tasks.length, subtasks.length]);

  // Build calendar items from goals, tasks, subtasks
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
          color: goal.priority?.toLowerCase() || "default",
          percentage: goal.completionPercentage,
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
          color: task.priority?.toLowerCase() || "default",
          percentage: task.completionPercentage,
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
          color: subtask.priority?.toLowerCase() || "default",
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

  // Memoized days for weekly view
  const days = useMemo(() => getDaysInWeek(currentDate), [currentDate]);

  // Filtered items based on filters
  const filteredItems = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(calendarItems).map(([date, items]) => [
          date,
          items.filter((item) => {
            const matchesPriority =
              selectedPriority === "all" ||
              item.priority?.toLowerCase() === selectedPriority.toLowerCase();
            const matchesType =
              selectedType === "all" || item.type === selectedType;
            const matchesCompletion = showCompleted || !item.completed;
            return matchesPriority && matchesType && matchesCompletion;
          }),
        ])
      ),
    [calendarItems, selectedPriority, selectedType, showCompleted]
  );

  // Monthly view calculations
  const month = monthDate.getMonth();
  const year = monthDate.getFullYear();
  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const lastDayOfWeek = getLastDayOfWeek(year, month);

  // Navigate week
  const navigateWeek = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction * 7);
      return newDate;
    });
  };

  // Navigate month
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

  // Handle item click to navigate to detail page
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

  // Get progress color based on percentage
  const getProgressColor = (progress) => {
    if (progress === 0) return "#ef4444";
    if (progress < 35) return "#f59e0b";
    if (progress < 75) return "#eab308";
    if (progress < 100) return "#84cc16";
    return "#10b981";
  };

  // Display progress (show full ring if 0%)
  const getDisplayProgress = (progress) => {
    if (progress === 0) return 100;
    return progress;
  };

  // Drag handlers
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
              [fromDateStr]:
                prev[fromDateStr]?.filter(
                  (item) => item.id !== draggedTask.item.id
                ) || [],
              [toDateStr]: [...(prev[toDateStr] || []), draggedTask.item],
            }));
            toast.success("Subtask moved successfully");
          })
          .catch((error) => {
            console.error("Failed to update subtask:", error);
            toast.error("Failed to move subtask");
          });
        break;
      default:
        break;
    }
    setDraggedTask(null);
  };

  // Toggle subtask completion
  const toggleItem = (date, item) => {
    const [type, id] = item.id.split("-");
    if (type !== "subtask") return;

    const updatedSubtask = {
      ...item.originalItem,
      completed: !item.originalItem.completed,
    };

    dispatch(updateSubtask({ id, subtaskData: updatedSubtask }))
      .then(() => {
        if (item.originalItem.taskId) {
          dispatch(
            updateTaskCompletion({ taskId: item.originalItem.taskId, subtasks })
          ).then(() => {
            if (item.originalItem.goalId) {
              dispatch(
                updateGoalCompletion({
                  goalId: item.originalItem.goalId,
                  subtasks,
                })
              ).catch((error) =>
                console.error("Failed to update goal:", error)
              );
            }
          });
        }
        toast.success("Subtask updated");
      })
      .catch((error) => {
        console.error("Failed to update subtask:", error);
        toast.error("Failed to update subtask");
      });

    const dateStr = date.toISOString().split("T")[0];
    setCalendarItems((prev) => ({
      ...prev,
      [dateStr]:
        prev[dateStr]?.map((i) =>
          i.id === item.id ? { ...i, completed: !i.completed } : i
        ) || [],
    }));
  };

  if (isLoading) return <LoadingSpinner message="Loading calendar..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <div>
          <h1>Task Calendar</h1>
        </div>

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

        <div className="navigation-buttons">
          <button
            onClick={
              view === "monthly" ? handlePrevMonth : () => navigateWeek(-1)
            }
            className="nav-button"
            aria-label={view === "monthly" ? "Previous month" : "Previous week"}
          >
            <ChevronLeft size={20} />
          </button>
          <span>
            {view === "monthly"
              ? `${monthDate.toLocaleString("default", {
                  month: "long",
                })} ${year}`
              : `Week of ${formatDate(days[0])}`}
          </span>
          <button
            onClick={
              view === "monthly" ? handleNextMonth : () => navigateWeek(1)
            }
            className="nav-button"
            aria-label={view === "monthly" ? "Next month" : "Next week"}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="calendar-filters">
        <div className="filter-group">
          <label htmlFor="priority-select">Priority</label>
          <select
            id="priority-select"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type-select">Type</label>
          <select
            id="type-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
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

      {/* Calendar Content */}
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
              const totalSubtasks = dayItems.filter(
                (item) => item.type === "subtask"
              ).length;
              const completedSubtasks = dayItems.filter(
                (item) => item.type === "subtask" && item.completed
              ).length;
              const isPastDay =
                date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

              let summaryText = "";
              let summaryClass = "";

              if (totalSubtasks === 0) {
                summaryText = "No subtasks";
                summaryClass = "empty";
              } else if (completedSubtasks === totalSubtasks) {
                summaryText = "All done 🎉";
                summaryClass = "done";
              } else if (completedSubtasks === 0) {
                summaryText = isPastDay ? "Overdue ⚠️" : "Not started";
                summaryClass = isPastDay ? "overdue" : "not-started";
              } else {
                summaryText = `${completedSubtasks} / ${totalSubtasks} completed`;
                summaryClass = isPastDay ? "overdue" : "in-progress";
              }

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
                          dayProgress === 0 && totalSubtasks > 0 ? "pulse" : ""
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

                  <div
                    className={`day-progress-bar ${
                      dayItems.length === 0 ? "empty" : ""
                    }`}
                  >
                    <div
                      className="day-progress-bar-fill"
                      style={{
                        width: `${getDisplayProgress(dayProgress)}%`,
                        backgroundColor: getProgressColor(dayProgress),
                      }}
                    />
                  </div>

                  <div className={`day-task-summary ${summaryClass}`}>
                    {summaryText}
                  </div>

                  <div className="calendar-task-list">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        className={`task-item ${
                          isTouchDevice ? "touch-device" : ""
                        }`}
                        data-priority={
                          item.priority?.toLowerCase() || "default"
                        }
                        onClick={() => handleItemClick(item)}
                        draggable={!isTouchDevice && item.type === "subtask"}
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
                          {item.text}
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

              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div
                  key={`empty-start-${i}`}
                  className="calendar-cell empty"
                ></div>
              ))}

              {daysInMonth.map((date) => {
                const dateStr = date.toISOString().split("T")[0];
                const count = (filteredItems[dateStr] || []).filter(
                  (item) => item.type === "subtask"
                ).length;
                const isToday =
                  new Date().toDateString() === date.toDateString();
                const items = filteredItems[dateStr] || [];

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
                    style={{ background: cellColor }}
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
                      ? "0"
                      : `${heatmapScale[idx - 1].max + 1}-${
                          level.max === Infinity ? "+" : level.max
                        }`}{" "}
                    tasks
                  </span>
                </div>
              ))}
            </div>

            {/* Customizable Scale Editor */}
            <div className="heatmap-scale-editor">
              <span style={{ fontWeight: 600 }}>Customize Scale:</span>
              {heatmapScale.map((level, idx) => (
                <span
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="number"
                    min={idx === 0 ? 0 : heatmapScale[idx - 1].max + 1}
                    max={
                      idx < heatmapScale.length - 1
                        ? heatmapScale[idx + 1].max - 1
                        : 99
                    }
                    value={level.max === Infinity ? "" : level.max}
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? Infinity
                          : parseInt(e.target.value, 10);
                      setHeatmapScale((scale) =>
                        scale.map((l, i) =>
                          i === idx ? { ...l, max: val } : l
                        )
                      );
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
                  />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day Popover Modal */}
      {selectedDay && (
        <DayPopover
          date={selectedDay.date}
          items={selectedDay.items}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
};

export default TaskCalendar;
