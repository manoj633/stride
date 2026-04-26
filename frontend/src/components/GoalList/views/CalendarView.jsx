// src/components/GoalList/views/CalendarView.jsx
import { useState } from "react";
import Calendar from "react-calendar";

const CalendarView = ({ goals }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day");

  /* ── date filtering ───────────────────────────────────────── */
  const inRange = (goal, start, end) => {
    if (!goal.duration?.startDate || !goal.duration?.endDate) return false;
    const s = new Date(goal.duration.startDate);
    const e = new Date(goal.duration.endDate);
    return s <= end && e >= start;
  };

  const displayGoals = (() => {
    if (viewMode === "day") {
      const d = new Date(selectedDate);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      return goals.filter((g) => inRange(g, d, next));
    }
    if (viewMode === "week") {
      const start = new Date(selectedDate);
      start.setDate(selectedDate.getDate() - selectedDate.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return goals.filter((g) => inRange(g, start, end));
    }
    // month
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth();
    return goals.filter((g) =>
      inRange(g, new Date(y, m, 1), new Date(y, m + 1, 0)),
    );
  })();

  const getCountForDate = (date) =>
    goals.filter((g) => {
      if (!g.duration?.startDate || !g.duration?.endDate) return false;
      const d = new Date(date);
      return (
        d >= new Date(g.duration.startDate) && d <= new Date(g.duration.endDate)
      );
    }).length;

  const getDateLabel = () => {
    if (viewMode === "day") {
      return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (viewMode === "week") {
      const start = new Date(selectedDate);
      start.setDate(selectedDate.getDate() - selectedDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${fmtShort(start)} – ${fmtShort(end, true)}`;
    }
    return selectedDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="calendar-view">
      {/* Left: calendar picker */}
      <div className="calendar-view__left">
        {/* View mode tabs */}
        <div className="calendar-view-tabs">
          {["day", "week", "month"].map((mode) => (
            <button
              key={mode}
              className={`calendar-view-tab${viewMode === mode ? " active" : ""}`}
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={({ date }) => {
            const count = getCountForDate(date);
            return count > 0 ? (
              <div className="cal-dot-row">
                {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                  <div key={i} className="cal-dot" />
                ))}
                {count > 3 && (
                  <span className="cal-dot-more">+{count - 3}</span>
                )}
              </div>
            ) : null;
          }}
        />

        {/* Compact stats */}
        <div className="calendar-summary">
          <div className="calendar-summary__item">
            <span className="calendar-summary__label">Active</span>
            <span className="calendar-summary__value">
              {
                goals.filter(
                  (g) =>
                    g.completionPercentage > 0 && g.completionPercentage < 100,
                ).length
              }
            </span>
          </div>
          <div className="calendar-summary__divider" />
          <div className="calendar-summary__item">
            <span className="calendar-summary__label">Done</span>
            <span
              className="calendar-summary__value"
              style={{ color: "var(--green)" }}
            >
              {goals.filter((g) => g.completionPercentage === 100).length}
            </span>
          </div>
        </div>
      </div>

      {/* Right: goal list for selected period */}
      <div className="calendar-goals-list">
        <div className="calendar-goals-list__header">
          <span className="calendar-goals-list__title">{getDateLabel()}</span>
          <span className="calendar-goals-list__count">
            {displayGoals.length} goal{displayGoals.length !== 1 ? "s" : ""}
          </span>
        </div>

        {displayGoals.length === 0 ? (
          <div className="calendar-empty">
            <p>No goals for this {viewMode}</p>
            <span>Select a different date or create a new goal</span>
          </div>
        ) : (
          displayGoals.map((goal) => <CalGoalItem key={goal._id} goal={goal} />)
        )}
      </div>
    </div>
  );
};

const CalGoalItem = ({ goal }) => (
  <div className="calendar-goal-item">
    {/* Priority stripe */}
    <div
      className="cal-item__stripe"
      style={{
        background:
          goal.priority === "High"
            ? "var(--red)"
            : goal.priority === "Medium"
              ? "var(--amber)"
              : "var(--green)",
      }}
    />

    <div className="cal-item__body">
      <div className="cal-item__top">
        <span className="cal-item__title">{goal.title}</span>
        <span className={`priority-badge ${goal.priority.toLowerCase()}`}>
          {goal.priority}
        </span>
      </div>

      {goal.description && <p className="cal-item__desc">{goal.description}</p>}

      {/* Progress */}
      <div className="cal-item__progress-track">
        <div
          className="cal-item__progress-bar"
          style={{ width: `${goal.completionPercentage}%` }}
        />
      </div>

      <div className="cal-item__meta">
        <span style={{ color: "var(--accent)", fontWeight: 600 }}>
          {goal.completionPercentage}%
        </span>
        {goal.category && <span>{goal.category}</span>}
        {goal.duration?.startDate && goal.duration?.endDate && (
          <span>
            {fmtShort(goal.duration.startDate)} →{" "}
            {fmtShort(goal.duration.endDate)}
          </span>
        )}
      </div>
    </div>
  </div>
);

const fmtShort = (d, year = false) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(year ? { year: "numeric" } : {}),
  });

export default CalendarView;
