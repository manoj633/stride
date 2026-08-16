// src/components/TaskCalendar/TaskCalendar.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import DayPopover from "./DayPopover";
import { fetchGoals, updateGoalCompletion, setSelectedGoal, clearError as clearGoalsError } from "../../store/features/goals/goalSlice";
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
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiTarget,
  FiLayers,
  FiList,
  FiActivity,
  FiArrowRight,
  FiAward
} from "react-icons/fi";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import "./TaskCalendar.css";

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

// Helper: Get full calendar grid (all 35 or 42 days, including prev and next month padding)
const getMonthMatrix = (year, month) => {
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const matrix = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    matrix.push({
      date: d,
      isCurrentMonth: false,
      dateStr: d.toISOString().split("T")[0],
    });
  }

  // 2. Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const d = new Date(year, month, day);
    matrix.push({
      date: d,
      isCurrentMonth: true,
      dateStr: d.toISOString().split("T")[0],
    });
  }

  // 3. Next month leading days to complete grid (multiples of 7: 35 or 42)
  const totalSlots = matrix.length > 35 ? 42 : 35;
  const remainingSlots = totalSlots - matrix.length;
  for (let day = 1; day <= remainingSlots; day++) {
    const d = new Date(year, month + 1, day);
    matrix.push({
      date: d,
      isCurrentMonth: false,
      dateStr: d.toISOString().split("T")[0],
    });
  }

  return matrix;
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
  const [view, setView] = useState("monthly"); // Default to monthly view
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
      if (e.key === "ArrowLeft") {
        if (view === "monthly") handlePrevMonth();
        else navigateWeek(-1);
      }
      if (e.key === "ArrowRight") {
        if (view === "monthly") handleNextMonth();
        else navigateWeek(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentDate, view]);

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
  const monthMatrix = useMemo(() => getMonthMatrix(year, month), [year, month]);

  // Monthly stats calculations
  const monthStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let highPriority = 0;

    daysInMonth.forEach((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const items = calendarItems[dateStr] || [];
      items.forEach((item) => {
        total++;
        if (item.completed) completed++;
        if (item.priority?.toLowerCase() === "high") highPriority++;
      });
    });

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, highPriority, rate };
  }, [daysInMonth, calendarItems]);

  // Upcoming items for agenda
  const upcomingItems = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const allEvents = [];
    Object.entries(calendarItems).forEach(([dateStr, items]) => {
      if (dateStr >= todayStr) {
        items.forEach((item) => {
          if (!item.completed) {
            allEvents.push({ ...item, dateStr });
          }
        });
      }
    });
    return allEvents
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
      .slice(0, 4);
  }, [calendarItems]);

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

  // Quick jump to Today
  const handleJumpToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
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

  const isLoading = loadingGoals || loadingTasks || loadingSubtasks;
  
  if (isLoading) return <LoadingSpinner message="Syncing calendar data..." />;
  
  if (goalsError) return <ErrorMessage message={`Goals: ${goalsError}`} />;
  if (tasksError) return <ErrorMessage message={`Tasks: ${tasksError}`} />;
  if (subtasksError) return <ErrorMessage message={`Subtasks: ${subtasksError}`} />;

  return (
    <div className="enhanced-calendar-container">
      <div className="enhanced-tasks">
        {/* Top Header Controls Bar */}
        <header className="enhanced-tasks__sidebar">
          <div className="enhanced-tasks__header">
            <div className="enhanced-tasks__header-title">
              <div className="header-icon--calendar">
                <FiCalendar />
              </div>
              <div>
                <h2>Workspace Calendar</h2>
                <span className="header-subtitle">Timeline & Milestones</span>
              </div>
            </div>

            <div className="tasks__stats">
              <button onClick={handleJumpToday} className="today-jump-btn">
                Today
              </button>

              <div className="navigation-buttons">
                <button
                  onClick={view === "monthly" ? handlePrevMonth : () => navigateWeek(-1)}
                  className="nav-button"
                  title="Previous"
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
                  title="Next"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>

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
        </header>

        {/* Main Content Area */}
        <div className="enhanced-tasks__main">
          {/* Main Calendar View Area */}
          <div className="enhanced-tasks__content">
            <div className="calendar-content">
              {view === "weekly" ? (
                /* Weekly Grid */
                <div className="calendar-grid weekly">
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
                      summaryText = "Clear schedule";
                      summaryClass = "empty";
                    } else if (completedSubtasks === totalSubtasks) {
                      summaryText = "All completed 🎉";
                      summaryClass = "done";
                    } else {
                      summaryText = `${completedSubtasks}/${totalSubtasks} done`;
                      summaryClass = isPastDay ? "overdue" : "in-progress";
                    }

                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                      <div
                        key={dateStr}
                        className={`calendar-cell weekly ${isToday ? "today" : ""}`}
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
                              className={`tk-row--mini ${item.completed ? 'completed' : ''}`}
                              onClick={() => handleItemClick(item)}
                            >
                              <div className={`mini-priority-indicator ${item.priority?.toLowerCase() || 'default'}`}></div>
                              <span className="mini-task-text">
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
                /* Uniform Monthly Calendar Matrix (35 or 42 perfectly spaced cells) */
                <div className="calendar-grid month">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="day-header">{day}</div>
                  ))}

                  {monthMatrix.map((cell) => {
                    const items = filteredItems[cell.dateStr] || [];
                    const isToday = new Date().toDateString() === cell.date.toDateString();

                    return (
                      <div
                        key={cell.dateStr}
                        className={`calendar-cell monthly ${cell.isCurrentMonth ? "in-month" : "out-of-month"} ${isToday ? "today" : ""}`}
                        onClick={() => setSelectedDay({ date: cell.date, items })}
                      >
                        <div className="cell-top-bar">
                          <span className="date-number">{cell.date.getDate()}</span>
                          {items.length > 0 && (
                            <span className="cell-event-badge">{items.length}</span>
                          )}
                        </div>

                        <div className="monthly-chips-container">
                          {items.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className={`cal-event-chip ${item.priority?.toLowerCase() || "default"} ${item.completed ? "completed" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleItemClick(item);
                              }}
                              title={item.text}
                            >
                              <span className="chip-dot" />
                              <span className="chip-text">{item.text}</span>
                            </div>
                          ))}
                          {items.length > 2 && (
                            <div className="cal-more-chip">
                              +{items.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Dynamic Insights & Agenda Sidebar */}
          <aside className="enhanced-tasks__chart-container calendar-insights">
            <div className="insights-header">
              <h3>Monthly Summary</h3>
              <p>{monthDate.toLocaleString("default", { month: "long" })} Overview</p>
            </div>

            {/* Monthly Performance Quick Stats */}
            <div className="month-stats-grid">
              <div className="cal-stat-card">
                <span className="cal-stat-label">Total Events</span>
                <span className="cal-stat-val">{monthStats.total}</span>
              </div>
              <div className="cal-stat-card">
                <span className="cal-stat-label">Completed</span>
                <span className="cal-stat-val">{monthStats.rate}%</span>
              </div>
              <div className="cal-stat-card">
                <span className="cal-stat-label">High Priority</span>
                <span className="cal-stat-val high">{monthStats.highPriority}</span>
              </div>
            </div>

            {/* Upcoming Deadlines Agenda */}
            <div className="insight-widget">
              <div className="widget-header-row">
                <h4 className="widget-title">Upcoming Agenda</h4>
                <span className="widget-badge">{upcomingItems.length}</span>
              </div>
              <div className="agenda-items-list">
                {upcomingItems.length === 0 ? (
                  <div className="empty-agenda">
                    <FiCheckCircle size={20} />
                    <span>No upcoming deadlines</span>
                  </div>
                ) : (
                  upcomingItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="agenda-item"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className={`agenda-type-icon ${item.type}`}>
                        {item.type === "goal" ? <FiTarget /> : item.type === "task" ? <FiList /> : <FiLayers />}
                      </div>
                      <div className="agenda-info">
                        <span className="agenda-title">{item.text}</span>
                        <span className="agenda-date"><FiClock /> {new Date(item.dateStr).toLocaleDateString()}</span>
                      </div>
                      <span className={`agenda-p-pill ${item.priority?.toLowerCase() || "medium"}`}>
                        {item.priority || "Med"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="insight-widget">
              <h4 className="widget-title">Activity Density</h4>
              <div className="mini-heatmap-grid">
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
                        title={`${date.getDate()} ${monthDate.toLocaleString('default', { month: 'short' })}: ${count} items`}
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
                 <span>Activity Level</span>
              </div>
            </div>
          </aside>
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
