// src/components/Pomodoro/TimerCard.jsx
import React, { useContext, useState, useEffect } from "react";
import { TimerContext } from "./TimerContext";
import { FiPlay, FiPause, FiRefreshCw } from "react-icons/fi";

const TimerCard = () => {
  const {
    minutes,
    seconds,
    isActive,
    activeTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    switchTimer,
  } = useContext(TimerContext);

  // Format time for display
  const formatTime = (time) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="timer-card">
      <div className="timer-tabs">
        <button
          className={`timer-tab ${activeTimer === "pomodoro" ? "active" : ""}`}
          onClick={() => switchTimer("pomodoro")}
        >
          Focus
        </button>
        <button
          className={`timer-tab ${
            activeTimer === "shortBreak" ? "active short-break" : ""
          }`}
          onClick={() => switchTimer("shortBreak")}
        >
          Short Break
        </button>
        <button
          className={`timer-tab ${
            activeTimer === "longBreak" ? "active long-break" : ""
          }`}
          onClick={() => switchTimer("longBreak")}
        >
          Long Break
        </button>
      </div>

      <div className="timer-display">
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>

      <div className="timer-controls">
        {!isActive ? (
          <button className="timer-button start" onClick={startTimer}>
            <FiPlay /> Start
          </button>
        ) : (
          <button className="timer-button pause" onClick={pauseTimer}>
            <FiPause /> Pause
          </button>
        )}
        <button className="timer-button reset" onClick={resetTimer}>
          <FiRefreshCw /> Reset
        </button>
      </div>
    </div>
  );
};

export default TimerCard;
