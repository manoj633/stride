// src/components/TaskCalendar/HeatMap.jsx
import React from "react";
import "./HeatMap.css";

const HeatMap = ({ data, onDayClick }) => {
  // Group data by month-year
  const groupedData = Object.entries(data).reduce((acc, [dateStr, value]) => {
    const date = new Date(dateStr);
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthYear = `${year}-${month + 1}`;

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push({ dateStr, ...value });
    return acc;
  }, {});

  // Find max value for color intensity
  const maxValue = Object.values(groupedData).reduce(
    (max, monthData) =>
      Math.max(max, ...monthData.map((dayData) => dayData.value)),
    0
  );

  // Generate background color based on value
  const getBackgroundColor = (value) => {
    if (value === 0) {
      return "#f8fafc";
    }

    const intensity = Math.round((value / maxValue) * 100);
    const hue = 200; // Blue hue
    const saturation = 60 + intensity / 4;
    const lightness = 95 - intensity / 1.5;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Get month name from index
  const getMonthName = (monthIndex) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[monthIndex];
  };

  // Get weekday abbreviations
  const getWeekdayNames = () => {
    return ["S", "M", "T", "W", "T", "F", "S"];
  };

  return (
    <div className="heatmap-calendar">
      {Object.entries(groupedData).map(([monthYear, monthData]) => {
        const [year, month] = monthYear.split("-").map(Number);
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const daysInMonth = new Date(year, month, 0).getDate();
        const startingDay = firstDayOfMonth.getDay();
        const weekdayNames = getWeekdayNames();

        return (
          <div key={monthYear} className="heatmap-month">
            <div className="heatmap-month-header">
              {getMonthName(month - 1)} {year}
            </div>

            <div className="heatmap-weekday-labels">
              {weekdayNames.map((day, idx) => (
                <div key={idx} className="heatmap-weekday-label">
                  {day}
                </div>
              ))}
            </div>

            <div className="heatmap-grid">
              {/* Empty cells before month starts */}
              {[...Array(startingDay)].map((_, index) => (
                <div key={`empty-${index}`} className="heatmap-cell empty" />
              ))}

              {/* Days of the month */}
              {[...Array(daysInMonth)].map((_, index) => {
                const day = index + 1;
                const dayData = monthData.find(
                  (d) => new Date(d.dateStr).getDate() === day
                );
                const value = dayData?.value || 0;
                const dateStr = new Date(year, month - 1, day)
                  .toISOString()
                  .split("T")[0];
                const isToday =
                  new Date().toDateString() ===
                  new Date(year, month - 1, day).toDateString();

                return (
                  <div
                    key={day}
                    className={`heatmap-cell ${isToday ? "today" : ""}`}
                    style={{
                      backgroundColor: getBackgroundColor(value),
                    }}
                    title={`${dateStr}: ${value} tasks`}
                    onClick={() => onDayClick && onDayClick(dateStr, dayData)}
                  >
                    <span className="heatmap-day-number">{day}</span>
                    {value > 0 && (
                      <span className="heatmap-count">{value}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HeatMap;
