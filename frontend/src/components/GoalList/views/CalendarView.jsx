import { useState } from "react";
import Calendar from "react-calendar";

const CalendarView = ({ goals }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const goalsForSelectedDate = goals.filter((goal) => {
    if (!goal.duration?.startDate || !goal.duration?.endDate) {
      return false;
    }
    const startDate = new Date(goal.duration.startDate);
    const endDate = new Date(goal.duration.endDate);
    return selectedDate >= startDate && selectedDate <= endDate;
  });

  return (
    <div className="calendar-view">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={({ date }) => {
          const hasGoals = goals.some((goal) => {
            const startDate = new Date(goal.duration?.startDate);
            const endDate = new Date(goal.duration?.endDate);
            return date >= startDate && date <= endDate;
          });
          return hasGoals ? (
            <div className="calendar-goals-indicator">•</div>
          ) : null;
        }}
      />
      <div className="calendar-goals-list">
        <h3>Goals for {selectedDate.toDateString()}</h3>
        {goalsForSelectedDate.map((goal) => (
          <div key={goal._id} className="calendar-goal-item">
            <div>{goal.title}</div>
            <div>{goal.completionPercentage}%</div>
            <div className="goal-duration">
              {new Date(goal.duration?.startDate).toLocaleDateString()} -
              {new Date(goal.duration?.endDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
