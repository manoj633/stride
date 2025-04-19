// src/components/Pomodoro/Pomodoro.jsx
import React from "react";
import TimerCard from "./TimerCard";
import "./Pomodoro.css";

const Pomodoro = () => {
  return (
    <div className="pomodoro-container">
      <div className="pomodoro-wrapper">
        <h1 className="pomodoro-title">Focus Timer</h1>
        <TimerCard />
      </div>
    </div>
  );
};

export default Pomodoro;
