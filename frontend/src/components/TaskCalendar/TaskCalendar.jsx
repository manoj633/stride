// src/components/TaskCalendar/TaskCalendar.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";

import HeatMap from "./HeatMap.jsx";

// Import the slice actions
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
  // const calendarGridRef = useRef(null);

  // Filtering State
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showCompleted, setShowCompleted] = useState(true);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Start loading
      if (goals.length === 0) {
        await dispatch(fetchGoals());
      }
      if (tasks.length === 0) {
        await dispatch(fetchTasks());
      }
      if (subtasks.length === 0) {
        await dispatch(fetchSubtasks());
      }
      setIsLoading(false); // Data fetched, stop loading
    };

    fetchData();
  }, [dispatch, goals.length, tasks.length, subtasks.length]);

  useEffect(() => {
    const itemsByDate = {};

    const addItemToCalendar = (item, startDate, endDate = startDate) => {
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

    goals.forEach((goal) => {
      addItemToCalendar(
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

  const toggleItem = (date, item) => {
    const [type, id] = item.id.split("-");

    // Update the completion status based on item type
    switch (type) {
      case "subtask":
        const updatedSubtask = {
          ...item.originalItem,
          completed: !item.originalItem.completed,
        };
        dispatch(updateSubtask({ id: id, subtaskData: updatedSubtask }))
          .then(() => {
            if (item.originalItem.taskId) {
              dispatch(
                updateTaskCompletion({
                  taskId: item.originalItem.taskId,
                  subtasks: subtasks,
                })
              )
                .then(() => {
                  // If task has goalId, update goal completion
                  if (item.originalItem.goalId) {
                    dispatch(
                      updateGoalCompletion({
                        goalId: item.originalItem.goalId,
                        subtasks: subtasks,
                      })
                    )
                      .then(() => {
                        toast.success("Subtask updated successfully");
                      })
                      .catch((error) => {
                        console.error(
                          "Failed to update goal completion:",
                          error
                        );
                      });
                  } else {
                    navigate(-1); // Navigate back if no goal update needed
                  }
                })
                .catch((error) => {
                  console.error("Failed to update task completion:", error);
                });
            } else {
              navigate(-1); // Navigate back if no task update needed
            }
          })
          .catch((error) => {
            console.error("Failed to update subtask:", error);
            toast.error("Failed to update subtask");
          });
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

    // Update the original item's date
    const updatedItem = {
      ...draggedTask.item.originalItem,
      dueDate: toDateStr, // Assuming you want to update dueDate on drop
    };

    // Determine the item type and dispatch the appropriate update action
    switch (draggedTask.item.type) {
      case "goal":
        dispatch(
          updateGoalCompletion({
            goalId: updatedItem._id,
            goalData: updatedItem,
          })
        )
          .then(() => {
            // Update calendarItems after successful update
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
            // Update calendarItems after successful update
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
            // Update calendarItems after successful update
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
        console.warn("Unknown item type:", draggedTask.item.type);
    }

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

  // Filtering Logic
  const filteredItems = Object.fromEntries(
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
  );

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
        {isLoading ? (
          <div>Loading calendar...</div>
        ) : view === "weekly" ? (
          <div
            className="calendar-grid"
            // ref={calendarGridRef}
            tabIndex={0}
          >
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
                        onClick={() => handleItemClick(item)}
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
        ) : (
          <HeatMap data={generateHeatmapData()} />
        )}
      </div>
    </div>
  );
};

export default TaskCalendar;
