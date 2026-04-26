// src/components/TaskCalendar/TaskCalendar.jsx
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import DayPopover from "./DayPopover";
import { fetchGoals, clearError as clearGoalsError } from "../../store/features/goals/goalSlice";
import {
  fetchTasks,
  setSelectedTask,
  updateTaskCompletion,
  clearError as clearTasksError,
} from "../../store/features/tasks/taskSlice";
import {
  fetchSubtasks,
  setSelectedSubtask,
  updateSubtask,
  clearError as clearSubtasksError,
} from "../../store/features/subtasks/subtaskSlice";
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiPlus, 
  FiCalendar, 
  FiTrendingUp 
} from "react-icons/fi";
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
  const { items: goals, loading: loadingGoals, error: goalsError } = useAppSelector((state) => state.goals);
  const { items: tasks, loading: loadingTasks, error: tasksError } = useAppSelector((state) => state.tasks);
  const { items: subtasks, loading: loadingSubtasks, error: subtasksError } = useAppSelector((state) => state.subtasks);

  const [calendarItems, setCalendarItems] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [view, setView] = useState("weekly");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showCompleted, setShowCompleted] = useState(true);
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
    dispatch(clearGoalsError());
    dispatch(clearTasksError());
    dispatch(clearSubtasksError());

    dispatch(fetchGoals());
    dispatch(fetchTasks());
    dispatch(fetchSubtasks());
  }, [dispatch]);

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

  const isLoading = loadingGoals || loadingTasks || loadingSubtasks;
  
  if (isLoading) return <LoadingSpinner message="Syncing enterprise data..." />;
  
  if (goalsError) return <ErrorMessage message={`Goals: ${goalsError}`} />;
  if (tasksError) return <ErrorMessage message={`Tasks: ${tasksError}`} />;
  if (subtasksError) return <ErrorMessage message={`Subtasks: ${subtasksError}`} />;

  return (
    <div className="enhanced-calendar-container">
      <div className="enhanced-tasks">
        {/* Top Navigation Bar */}
        <div className="enhanced-tasks__sidebar">
          <div className="enhanced-tasks__header">
            <div className="enhanced-tasks__header-title">
              <div className="header-icon--calendar">
                <FiCalendar />
              </div>
              <h2>Enterprise Calendar</h2>
            </div>

            <div className="tasks__stats">
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
                <button
                  onClick={view === "monthly" ? handlePrevMonth : () => navigateWeek(-1)}
                  className="nav-button"
                >
                  <FiChevronLeft size={16} />
                </button>
                <span className="current-date-label">
                  {view === "monthly"
                    ? `${monthDate.toLocaleString("default", { month: "long" })} ${year}`
                    : `Week of ${formatDate(days[0])}`}
                </span>
                <button
                  onClick={view === "monthly" ? handleNextMonth : () => navigateWeek(1)}
                  className="nav-button"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="enhanced-tasks__actions">
              <div className="calendar-filter-dropdowns">
                 <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="enterprise-select"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="enterprise-select"
                  >
                    <option value="all">All Types</option>
                    <option value="goal">Goals</option>
                    <option value="task">Tasks</option>
                    <option value="subtask">Subtasks</option>
                  </select>
              </div>

              <button className="enhanced-tasks__add-btn" onClick={() => navigate('/tasks/add')}>
                <FiPlus size={14} /> Add Event
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="enhanced-tasks__main">
          {/* Left: The Calendar Grid */}
          <div className="enhanced-tasks__content">
            <div className="calendar-content">
              {view === "weekly" ? (
                <div className="calendar-grid">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="day-header">{day}</div>
                  ))}

                  {days.map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const dayItems = filteredItems[dateStr] || [];
                    const totalSubtasks = dayItems.filter(item => item.type === "subtask").length;
                    const completedSubtasks = dayItems.filter(item => item.type === "subtask" && item.completed).length;
                    const isPastDay = date.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

                    let summaryText = "";
                    let summaryClass = "";

                    if (totalSubtasks === 0) {
                      summaryText = "No subtasks";
                      summaryClass = "empty";
                    } else if (completedSubtasks === totalSubtasks) {
                      summaryText = "All done 🎉";
                      summaryClass = "done";
                    } else {
                      summaryText = `${completedSubtasks}/${totalSubtasks} done`;
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
                          <span className="date-number">{date.getDate()}</span>
                          <span className="date-month">{formatDate(date).split(' ')[0]}</span>
                        </div>

                        <div className="calendar-task-list">
                          {dayItems.map((item) => (
                            <div
                              key={item.id}
                              className="tk-row--mini"
                              data-priority={item.priority?.toLowerCase() || 'default'}
                              onClick={() => handleItemClick(item)}
                            >
                              <div className={`mini-priority-indicator ${item.priority?.toLowerCase()}`}></div>
                              <span className={`mini-task-text ${item.completed ? 'completed' : ''}`}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className={`mini-day-summary ${summaryClass}`}>
                           {summaryText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Monthly View Grid (Larger version) */
                <div className="calendar-grid month">
                   {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="day-header">{day}</div>
                  ))}

                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-start-${i}`} className="calendar-cell empty"></div>
                  ))}

                  {daysInMonth.map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const items = filteredItems[dateStr] || [];
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                      <div
                        key={dateStr}
                        className={`calendar-cell monthly ${isToday ? "today" : ""}`}
                        onClick={() => setSelectedDay({ date, items })}
                      >
                        <span className="date-number">{date.getDate()}</span>
                        {items.length > 0 && <span className="item-count-dot">{items.length}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Insights Sidebar */}
          <div className="enhanced-tasks__chart-container calendar-insights">
            <div className="insights-header">
              <h3>Calendar Insights</h3>
              <p>Visualizing your timeline</p>
            </div>

            <div className="insight-widget">
              <h4 className="widget-title">Activity Heatmap</h4>
              <div className="mini-heatmap-grid">
                 {/* Mini monthly view for heatmap */}
                 {daysInMonth.map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const count = (filteredItems[dateStr] || []).length;
                    const scaleIdx = heatmapScale.findIndex(level => count <= level.max);
                    const cellColor = heatmapScale[scaleIdx]?.color || "#f8f9fa";
                    return (
                      <div 
                        key={dateStr} 
                        className="mini-heatmap-cell" 
                        style={{ background: cellColor }}
                        title={`${count} items`}
                      ></div>
                    );
                 })}
              </div>
              <div className="heatmap-legend--sidebar">
                 <div className="legend-swatches">
                    {heatmapScale.slice(0, 4).map((level, i) => (
                      <div key={i} className="swatch" style={{ background: level.color }}></div>
                    ))}
                 </div>
                 <span>Productivity Level</span>
              </div>
            </div>

            <div className="insight-widget mt-auto">
              <div className="productivity-promo">
                <div className="promo-icon"><FiTrendingUp /></div>
                <h4>Peak Performance</h4>
                <p>You are most active on <strong>Tuesdays</strong>. Keep the momentum!</p>
              </div>
            </div>
          </div>
        </div>
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
