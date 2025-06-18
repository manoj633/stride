// components/TimerButton.js
import React from "react";
import "./TimerButton.css"; // Create this CSS file

const TimerButton = ({ isRunning, onStartPause, onReset }) => {
  return (
    <div className="timer-button-container">
      <button
        className={`timer-button ${isRunning ? "pause" : "start"}`}
        onClick={onStartPause}
        aria-label={isRunning ? "Pause timer" : "Start timer"}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
      <button
        className="timer-button reset"
        onClick={onReset}
        aria-label="Reset timer"
      >
        Reset
      </button>
    </div>
  );
};

export default TimerButton;
