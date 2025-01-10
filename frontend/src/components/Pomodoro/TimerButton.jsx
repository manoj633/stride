// components/TimerButton.js
import React from "react";
import "./TimerButton.css"; // Create this CSS file

const TimerButton = ({ isRunning, onStartPause, onReset }) => {
  return (
    <div className="timer-button-container">
      <button
        className={`timer-button ${isRunning ? "pause" : "start"}`}
        onClick={onStartPause}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
      <button className="timer-button reset" onClick={onReset}>
        Reset
      </button>
    </div>
  );
};

export default TimerButton;
