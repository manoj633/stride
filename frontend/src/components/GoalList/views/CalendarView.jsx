import { useState } from "react";
import Calendar from "react-calendar";

const CalendarView = ({ goals }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day"); // 'day', 'week', 'month'

  const goalsForSelectedDate = goals.filter((goal) => {
    if (!goal.duration?.startDate || !goal.duration?.endDate) {
      return false;
    }
    const startDate = new Date(goal.duration.startDate);
    const endDate = new Date(goal.duration.endDate);
    return selectedDate >= startDate && selectedDate <= endDate;
  });

  const getWeekGoals = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return goals.filter((goal) => {
      if (!goal.duration?.startDate || !goal.duration?.endDate) return false;
      const startDate = new Date(goal.duration.startDate);
      const endDate = new Date(goal.duration.endDate);
      return startDate <= endOfWeek && endDate >= startOfWeek;
    });
  };

  const getMonthGoals = () => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    return goals.filter((goal) => {
      if (!goal.duration?.startDate || !goal.duration?.endDate) return false;
      const startDate = new Date(goal.duration.startDate);
      const endDate = new Date(goal.duration.endDate);
      return (
        (startDate.getMonth() === month && startDate.getFullYear() === year) ||
        (endDate.getMonth() === month && endDate.getFullYear() === year) ||
        (startDate <= new Date(year, month, 1) &&
          endDate >= new Date(year, month + 1, 0))
      );
    });
  };

  const displayGoals =
    viewMode === "day"
      ? goalsForSelectedDate
      : viewMode === "week"
      ? getWeekGoals()
      : getMonthGoals();

  const getGoalCountForDate = (date) => {
    return goals.filter((goal) => {
      if (!goal.duration?.startDate || !goal.duration?.endDate) return false;
      const startDate = new Date(goal.duration.startDate);
      const endDate = new Date(goal.duration.endDate);
      return date >= startDate && date <= endDate;
    }).length;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#dc2626";
      case "Medium":
        return "#f59e0b";
      case "Low":
        return "#16a34a";
      default:
        return "#64748b";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDateRangeText = () => {
    if (viewMode === "day") {
      return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (viewMode === "week") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${endOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else {
      return selectedDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  };

  return (
    <div className="calendar-view">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* View Mode Selector */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "0.5rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            border: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          {["day", "week", "month"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                flex: 1,
                padding: "0.625rem 1rem",
                border: "none",
                borderRadius: "8px",
                background:
                  viewMode === mode
                    ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                    : "transparent",
                color: viewMode === mode ? "white" : "#64748b",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
                textTransform: "capitalize",
              }}
            >
              {mode === "day" && "📅"}
              {mode === "week" && "📆"}
              {mode === "month" && "🗓️"} {mode}
            </button>
          ))}
        </div>

        {/* Calendar */}
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={({ date }) => {
            const count = getGoalCountForDate(date);
            return count > 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "2px",
                  marginTop: "4px",
                  flexWrap: "wrap",
                }}
              >
                {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    }}
                  />
                ))}
                {count > 3 && (
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "#3b82f6",
                      fontWeight: 700,
                    }}
                  >
                    +{count - 3}
                  </div>
                )}
              </div>
            ) : null;
          }}
        />

        {/* Calendar Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.75rem",
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            border: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#64748b",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              ACTIVE GOALS
            </div>
            <div
              style={{ fontSize: "1.5rem", fontWeight: 700, color: "#3b82f6" }}
            >
              {
                goals.filter(
                  (g) =>
                    g.completionPercentage > 0 && g.completionPercentage < 100
                ).length
              }
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "0.7rem",
                color: "#64748b",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              COMPLETED
            </div>
            <div
              style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16a34a" }}
            >
              {goals.filter((g) => g.completionPercentage === 100).length}
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="calendar-goals-list">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "2px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "#1a1a1a",
            }}
          >
            {viewMode === "day" && "📅"}
            {viewMode === "week" && "📆"}
            {viewMode === "month" && "🗓️"} {getDateRangeText()}
          </h3>
          <div
            style={{
              padding: "0.5rem 1rem",
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#3b82f6",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            {displayGoals.length} Goal{displayGoals.length !== 1 ? "s" : ""}
          </div>
        </div>

        {displayGoals.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              background: "rgba(100, 116, 139, 0.05)",
              borderRadius: "12px",
              border: "2px dashed rgba(100, 116, 139, 0.2)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
            <div
              style={{ fontSize: "1rem", color: "#64748b", fontWeight: 600 }}
            >
              No goals for this {viewMode}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                marginTop: "0.5rem",
              }}
            >
              Select a different date or create a new goal
            </div>
          </div>
        ) : (
          displayGoals.map((goal) => (
            <div
              key={goal._id}
              className="calendar-goal-item"
              style={{
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Priority Indicator Bar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  background: getPriorityColor(goal.priority),
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: "#1a1a1a",
                    fontSize: "1rem",
                    flex: 1,
                    marginRight: "1rem",
                  }}
                >
                  {goal.title}
                </div>
                <div
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: `${getPriorityColor(goal.priority)}15`,
                    color: getPriorityColor(goal.priority),
                    border: `1px solid ${getPriorityColor(goal.priority)}30`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {goal.priority === "High" && "🔴"}
                  {goal.priority === "Medium" && "🟡"}
                  {goal.priority === "Low" && "🟢"} {goal.priority}
                </div>
              </div>

              {goal.description && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#64748b",
                    lineHeight: "1.5",
                    marginBottom: "0.75rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {goal.description}
                </div>
              )}

              {/* Progress Bar */}
              <div
                style={{
                  position: "relative",
                  height: "8px",
                  background: "rgba(0, 0, 0, 0.05)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${goal.completionPercentage}%`,
                    background:
                      "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                    borderRadius: "10px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>

              {/* Meta Info Row */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  fontSize: "0.75rem",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span>📊</span>
                  <span style={{ fontWeight: 600, color: "#3b82f6" }}>
                    {goal.completionPercentage}%
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <span>📁</span>
                  <span>{goal.category}</span>
                </div>
                {goal.duration?.startDate && goal.duration?.endDate && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <span>🗓️</span>
                    <span>
                      {formatDate(goal.duration.startDate)} -{" "}
                      {formatDate(goal.duration.endDate)}
                    </span>
                  </div>
                )}
                {goal.collaborators && goal.collaborators.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <span>👥</span>
                    <span>{goal.collaborators.length}</span>
                  </div>
                )}
                {goal.comments && goal.comments.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <span>💬</span>
                    <span>{goal.comments.length}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarView;
