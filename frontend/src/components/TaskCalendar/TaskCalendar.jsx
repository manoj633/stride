// src/components/TaskCalendar/TaskCalendar.jsx
import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import HeatMap from "./HeatMap.jsx";
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

const COLORS = {
  high: "#f87171", // Red
  medium: "#fbbf24", // Yellow
  low: "#86efac", // Green
  default: "#cbd5e1",
};

const TaskCalendar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const calendarRef = useRef(null);
  const goals = useAppSelector((state) => state.goals.items);
  const tasks = useAppSelector((state) => state.tasks.items);
  const subtasks = useAppSelector((state) => state.subtasks.items);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("timeGridWeek");

  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTasks());
    dispatch(fetchSubtasks());
  }, [dispatch]);

  useEffect(() => {
    const newEvents = [];

    const addEvents = (items, type) => {
      items.forEach((item) => {
        const start =
          type === "subtask"
            ? new Date(item.dueDate)
            : new Date(item.startDate);
        const end = type === "subtask" ? start : new Date(item.endDate);
        end.setDate(end.getDate() + 1); // FullCalendar excludes end date

        newEvents.push({
          id: `${type}-${item._id}`,
          title: item.title || item.name,
          start,
          end,
          allDay: true,
          extendedProps: {
            type,
            priority: item.priority,
            completed: item.completed,
            originalItem: item,
          },
        });
      });
    };

    addEvents(goals, "goal");
    addEvents(tasks, "task");
    addEvents(subtasks, "subtask");

    setEvents(newEvents);
  }, [goals, tasks, subtasks]);

  const handleEventClick = (clickInfo) => {
    const { type, originalItem } = clickInfo.event.extendedProps;
    const id = clickInfo.event.id.split("-")[1];

    switch (type) {
      case "goal":
        dispatch(setSelectedGoal(originalItem));
        navigate(`/goals/${id}`);
        break;
      case "task":
        dispatch(setSelectedTask(originalItem));
        navigate(`/tasks/${id}`);
        break;
      case "subtask":
        dispatch(setSelectedSubtask(originalItem));
        navigate(`/subtasks/${id}`);
        break;
    }
  };

  const handleEventDrop = async (dropInfo) => {
    const { event, oldEvent } = dropInfo;
    const [type, id] = event.id.split("-");

    try {
      const newDate = event.start;
      console.log(newDate);
      const updateData = { dueDate: newDate };

      if (type === "subtask") {
        await dispatch(
          updateSubtask({
            id,
            subtaskData: {
              ...event.extendedProps.originalItem,
              dueDate: newDate,
            },
          })
        );

        try {
          // Assuming you have an API route like '/api/subtasks/:id'
          const response = await fetch(`/api/subtasks/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ dueDate: newDate }), // Sending the new date to the backend
          });

          if (!response.ok) {
            throw new Error("Failed to update subtask on the server");
          }
        } catch (error) {
          console.error("Error updating subtask on server:", error);
          // Handle error (e.g., revert the drag on the calendar)
          event.setStart(oldEvent.start);
          toast.error("Failed to update subtask");
        }
      }
      // Add similar logic for tasks/goals if needed

      toast.success("Item updated successfully");
    } catch (error) {
      console.error("Failed to update item:", error);
      event.setStart(oldEvent.start);
      toast.error("Failed to update item");
    }
  };

  const handleCheckboxChange = async (event, subTaskId) => {
    const subtask = subtasks.find((st) => st._id === subTaskId);
    const updatedSubtask = { ...subtask, completed: !subtask.completed };

    try {
      await dispatch(
        updateSubtask({ id: subTaskId, subtaskData: updatedSubtask })
      );
      setEvents(
        events.map((evt) =>
          evt.id === event.id
            ? {
                ...evt,
                extendedProps: {
                  ...evt.extendedProps,
                  completed: !evt.extendedProps.completed,
                },
              }
            : evt
        )
      );
    } catch (error) {
      console.error("Failed to update subtask:", error);
      toast.error("Failed to update subtask");
    }
  };

  const renderEventContent = (eventInfo) => {
    const {
      title,
      extendedProps: { type, priority, completed },
    } = eventInfo.event;
    const eventClasses = ["fc-event-content"];

    if (completed) {
      eventClasses.push("completed");
    }

    const backgroundColor = completed
      ? COLORS.default
      : COLORS[priority.toLowerCase()];

    return (
      <div
        className={eventClasses.join(" ")}
        style={{ backgroundColor, color: "black" }}
      >
        {type === "subtask" && (
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => {
              e.stopPropagation();
              handleCheckboxChange(
                eventInfo.event,
                eventInfo.event.id.split("-")[1]
              );
            }}
            className="task-checkbox"
          />
        )}
        <span className="task-title" style={{ whiteSpace: "normal" }}>
          {title}
        </span>
      </div>
    );
  };

  const generateHeatmapData = () => {
    const heatmapData = {};
    for (const dateStr in calendarItems) {
      if (calendarItems.hasOwnProperty(dateStr)) {
        const taskCount = calendarItems[dateStr].filter(
          (item) => item.type === "subtask"
        ).length;
        heatmapData[dateStr] = { value: taskCount };
      }
    }
    return heatmapData;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>
          {view === "timeGridWeek" ? "Weekly Overview" : "Monthly Overview"}
        </h1>
        <div className="view-switch">
          <button
            onClick={() => setView("timeGridWeek")}
            className={view === "timeGridWeek" ? "active" : ""}
          >
            Weekly
          </button>
          <button
            onClick={() => setView("dayGridMonth")}
            className={view === "dayGridMonth" ? "active" : ""}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="calendar-content">
        {view === "dayGridMonth" ? (
          <HeatMap data={generateHeatmapData()} />
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            dayHeaderFormat={{
              weekday: "short", // Short day name (e.g., "Sun")
              day: "numeric", // Day of the month (e.g., "25")
              month: "short", // Short month name (e.g., "Feb")
            }}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            locales={[
              {
                code: "en", // Assuming you're using English
                allDayText: "All day", // Change the label here
              },
            ]}
            events={events}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventContent={renderEventContent}
            eventClassNames={({ event: calendarEvent }) => {
              const {
                extendedProps: { type, priority, completed },
              } = calendarEvent;
              const eventClasses = [];

              // Add class based on priority
              eventClasses.push(`priority-${priority.toLowerCase()}`);

              return eventClasses;
            }}
            editable={true}
            droppable={true}
            nowIndicator={true}
            eventDisplay="block"
            height="auto"
            allDaySlot={true} // Ensure all-day slot is enabled
            slotDuration={"24:00:00"} // Force all day
            slotMinTime={"00:00:00"} // Set the minimum time to midnight
            slotMaxTime={"00:00:00"} // Set the maximum time to midnight
          />
        )}
      </div>
    </div>
  );
};

export default TaskCalendar;
