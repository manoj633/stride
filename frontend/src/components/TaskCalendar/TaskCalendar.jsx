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
        toast.error("Failed to load calendar data");
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
            toast.error("Failed to update goal");
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
            toast.error("Failed to update task");
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
            toast.error("Failed to update subtask");
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
      case "subtask": {
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
                    .catch((error) => {
                      console.error("Failed to update goal completion:", error);
                      toast.error("Failed to update goal completion");
                    });
                }
              });
            }
          })
          .catch((error) => {
            console.error("Failed to update subtask:", error);
            toast.error("Failed to update subtask");
          });
        break;
      }
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

  // Render
  return (
    <div className="task-calendar">
      <div className="calendar-header">
        <div className="date-navigation">
          <button className="prev-month" onClick={handlePrevMonth}>
            <ChevronLeft />
          </button>
          <div className="current-month">
            {monthDate.toLocaleString("default", { month: "long" })}{" "}
            {monthDate.getFullYear()}
          </div>
          <button className="next-month" onClick={handleNextMonth}>
            <ChevronRight />
          </button>
        </div>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${view === "weekly" ? "active" : ""}`}
            onClick={() => setView("weekly")}
          >
            Weekly
          </button>
          <button
            className={`toggle-btn ${view === "monthly" ? "active" : ""}`}
            onClick={() => setView("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!isLoading && !error && view === "weekly" && (
        <div className="weekly-view">
          <div className="days-header">
            {days.map((day) => (
              <div key={day} className="day-cell">
                {formatDate(day)}
              </div>
            ))}
          </div>
          <div className="tasks-container">
            {Object.entries(filteredItems).map(([date, items]) => (
              <div key={date} className="tasks-row">
                <div className="date-label">{formatDate(new Date(date))}</div>
                <div className="tasks-list">
                  {items.length === 0 && (
                    <div className="no-tasks">No tasks for this date</div>
                  )}
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`task-item ${item.color}`}
                      onClick={() => handleItemClick(item)}
                      draggable
                      onDragStart={() => handleDragStart(new Date(date), item)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(new Date(date))}
                    >
                      <div className="task-content">
                        <div className="task-title">{item.text}</div>
                        <div className="task-priority">
                          {item.priority.charAt(0).toUpperCase() +
                            item.priority.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!isLoading && !error && view === "monthly" && (
        <div className="monthly-view">
          <div className="month-header">
            {monthDate.toLocaleString("default", { month: "long" })}{" "}
            {monthDate.getFullYear()}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="empty-cell" />
            ))}
            {daysInMonth.map((day) => (
              <div
                key={day}
                className="day-cell"
                onClick={() => setSelectedDay(day)}
              >
                <div className="date-number">{day.getDate()}</div>
                <div className="day-items">
                  {filteredItems[day.toISOString().split("T")[0]]?.map(
                    (item) => (
                      <div
                        key={item.id}
                        className={`item-bubble ${item.color}`}
                        onClick={() => handleItemClick(item)}
                      >
                        {item.text}
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
            {Array.from({ length: 6 - lastDayOfWeek }).map((_, i) => (
              <div key={`empty-end-${i}`} className="empty-cell" />
            ))}
          </div>
          {selectedDay && (
            <DayPopover
              date={selectedDay}
              items={filteredItems[selectedDay.toISOString().split("T")[0]]}
              onClose={() => setSelectedDay(null)}
              onItemClick={handleItemClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          )}
        </div>
      )}
      <div className="heatmap-container">
        <div className="heatmap-header">Task Heatmap</div>
        <div className="heatmap-scale">
          {heatmapScale.map((scale, index) => (
            <div
              key={index}
              className="scale-item"
              style={{ backgroundColor: scale.color }}
            >
              {scale.max === Infinity
                ? "7+ tasks"
                : `Up to ${scale.max} task${scale.max > 1 ? "s" : ""}`}
            </div>
          ))}
        </div>
        <div className="heatmap-body">
          {Object.entries(heatmapData).map(([date, data]) => (
            <div
              key={date}
              className="heatmap-item"
              style={{
                backgroundColor:
                  heatmapScale.find((scale) => data.value <= scale.max)
                    ?.color || "transparent",
              }}
              title={`${data.value} task${
                data.value !== 1 ? "s" : ""
              } on ${formatDate(new Date(date))}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCalendar;
