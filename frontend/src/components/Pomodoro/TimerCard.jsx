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
          aria-label="Switch to Pomodoro focus timer"
        >
          Focus
        </button>
        <button
          className={`timer-tab ${
            activeTimer === "shortBreak" ? "active short-break" : ""
          }`}
          onClick={() => switchTimer("shortBreak")}
          aria-label="Switch to short break timer"
        >
          Short Break
        </button>
        <button
          className={`timer-tab ${
            activeTimer === "longBreak" ? "active long-break" : ""
          }`}
          onClick={() => switchTimer("longBreak")}
          aria-label="Switch to long break timer"
        >
          Long Break
        </button>
      </div>

      <div className="timer-display">
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>

      <div className="timer-controls">
        {!isActive ? (
          <button
            className="timer-button start"
            onClick={startTimer}
            aria-label="Start timer"
          >
            <FiPlay /> Start
          </button>
        ) : (
          <button
            className="timer-button pause"
            onClick={pauseTimer}
            aria-label="Pause timer"
          >
            <FiPause /> Pause
          </button>
        )}
        <button
          className="timer-button reset"
          onClick={resetTimer}
          aria-label="Reset timer"
        >
          <FiRefreshCw /> Reset
        </button>
      </div>
    </div>
  );
};

export default TimerCard;
