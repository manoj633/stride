// components/TimerCard.js
import React, { useState, useEffect, useContext } from "react";
import TimerButton from "./TimerButton"; // Assuming you create this for the Start/Pause button
import "./TimerCard.css";
import { TimerContext } from "./TimerContext";

const TIMER_STATES = {
  POMODORO: "pomodoro",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak",
};

const TIMER_DURATIONS = {
  [TIMER_STATES.POMODORO]: 25 * 60, // 25 minutes in seconds
  [TIMER_STATES.SHORT_BREAK]: 5 * 60, // 5 minutes in seconds
  [TIMER_STATES.LONG_BREAK]: 15 * 60, // 15 minutes in seconds
};

const TimerCard = ({ onPomodoroComplete }) => {
  const { activeTimer, setActiveTimer } = useContext(TimerContext);
  const [secondsRemaining, setSecondsRemaining] = useState(
    TIMER_DURATIONS[activeTimer]
  );
  const [isRunning, setIsRunning] = useState(false);

  const handleTimerSelection = (timerType) => {
    setActiveTimer(timerType);
    setSecondsRemaining(TIMER_DURATIONS[timerType]);
    setIsRunning(false); // Reset timer when switching types
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setSecondsRemaining(TIMER_DURATIONS[activeTimer]);
    setIsRunning(false);
  };

  useEffect(() => {
    let intervalId;
    if (isRunning && secondsRemaining > 0) {
      intervalId = setInterval(() => {
        setSecondsRemaining((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else {
      clearInterval(intervalId);
      if (secondsRemaining === 0 && activeTimer === TIMER_STATES.POMODORO) {
        onPomodoroComplete();
      }
    }
    return () => clearInterval(intervalId);
  }, [isRunning, secondsRemaining, activeTimer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  return (
    <div className="timer-card-container">
      <div className={`timer-card ${activeTimer}`}>
        <div className="timer-card__buttons">
          <button
            className={`timer-card__button ${
              activeTimer === TIMER_STATES.POMODORO ? "active" : ""
            }`}
            onClick={() => handleTimerSelection(TIMER_STATES.POMODORO)}
          >
            Pomodoro
          </button>
          <button
            className={`timer-card__button ${
              activeTimer === TIMER_STATES.SHORT_BREAK ? "active" : ""
            }`}
            onClick={() => handleTimerSelection(TIMER_STATES.SHORT_BREAK)}
          >
            Short Break
          </button>
          <button
            className={`timer-card__button ${
              activeTimer === TIMER_STATES.LONG_BREAK ? "active" : ""
            }`}
            onClick={() => handleTimerSelection(TIMER_STATES.LONG_BREAK)}
          >
            Long Break
          </button>
        </div>
        <div className="timer-card__display">
          {formatTime(secondsRemaining)}
        </div>
        <div className="timer-card__controls">
          <TimerButton
            isRunning={isRunning}
            onStartPause={handleStartPause}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
};

export default TimerCard;
