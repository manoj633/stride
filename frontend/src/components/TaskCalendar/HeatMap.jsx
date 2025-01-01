// src/components/TaskCalendar/HeatMap.jsx
import React from "react";
import "./HeatMap.css";

const HeatMap = ({ data }) => {
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

  const maxValue = Object.values(groupedData).reduce(
    (max, monthData) =>
      Math.max(max, ...monthData.map((dayData) => dayData.value)),
    0
  );

  const getBackgroundColor = (value) => {
    if (value === 0) {
      return "#f0f0f0";
    }

    const intensity = Math.round((value / maxValue) * 100);
    const saturation = 50;
    const lightness = 96 - intensity / 1.2;

    return `hsl(200, ${saturation}%, ${lightness}%)`;
  };

  const getMonthName = (monthIndex) => {
    const monthNames = [
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
    return monthNames[monthIndex];
  };

  const getWeekdayNames = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days;
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
            <div className="heatmap-month-header">{`${getMonthName(
              month - 1
            )} ${year}`}</div>
            <div className="heatmap-grid">
              {weekdayNames.map((day) => (
                <div key={day} className="heatmap-weekday-header">
                  {day}
                </div>
              ))}
              {[...Array(daysInMonth + startingDay)].map((_, index) => {
                const dayData = monthData.find(
                  (day) =>
                    new Date(day.dateStr).getDate() === index - startingDay + 1
                );

                if (index < startingDay) {
                  return <div key={index} className="heatmap-cell empty" />;
                }

                return (
                  <div
                    key={index}
                    className="heatmap-cell"
                    style={{
                      backgroundColor: dayData
                        ? getBackgroundColor(dayData.value)
                        : "#f0f0f0",
                    }}
                    title={
                      dayData
                        ? `${dayData.dateStr}: ${dayData.value} tasks`
                        : `${
                            new Date(year, month - 1, index - startingDay + 1)
                              .toISOString()
                              .split("T")[0]
                          }: No tasks`
                    }
                  ></div>
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
