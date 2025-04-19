// src/components/Pomodoro/TimerContext.jsx
import React, { createContext, useState, useEffect, useRef } from "react";

// Define timer constants
export const TIMER_STATES = {
  POMODORO: "pomodoro",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak",
};

// Define default timer durations (in minutes)
const TIMER_DURATIONS = {
  [TIMER_STATES.POMODORO]: 25,
  [TIMER_STATES.SHORT_BREAK]: 5,
  [TIMER_STATES.LONG_BREAK]: 15,
};

const TimerContext = createContext();

const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(TIMER_STATES.POMODORO);
  const [minutes, setMinutes] = useState(
    TIMER_DURATIONS[TIMER_STATES.POMODORO]
  );
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const POMODOROS_BEFORE_LONG_BREAK = 4; // Standard is 4 Pomodoros before a long break

  const intervalRef = useRef(null);
  const autoSwitchRef = useRef(false);

  // Reset the timer when the active timer changes, but preserve isActive state during auto-switch
  useEffect(() => {
    if (autoSwitchRef.current) {
      // This is an auto-switch, so just reset the time values but keep running
      clearInterval(intervalRef.current);
      setMinutes(TIMER_DURATIONS[activeTimer]);
      setSeconds(0);
      autoSwitchRef.current = false;
    } else {
      // This is a manual switch, do a full reset
      resetTimer();
    }
  }, [activeTimer]);

  // Handle the timer countdown
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer complete - handle the switch
            clearInterval(intervalRef.current);

            // Set the flag to indicate this is an auto-switch
            autoSwitchRef.current = true;

            // Auto switch based on current timer type
            if (activeTimer === TIMER_STATES.POMODORO) {
              // Increment completed pomodoros
              const newCompletedCount = completedPomodoros + 1;
              setCompletedPomodoros(newCompletedCount);

              // Check if it's time for a long break
              if (newCompletedCount % POMODOROS_BEFORE_LONG_BREAK === 0) {
                setActiveTimer(TIMER_STATES.LONG_BREAK);
              } else {
                setActiveTimer(TIMER_STATES.SHORT_BREAK);
              }
            } else {
              // After any break, go back to Pomodoro
              setActiveTimer(TIMER_STATES.POMODORO);
            }
          } else {
            setMinutes((prevMinutes) => prevMinutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds((prevSeconds) => prevSeconds - 1);
        }
      }, 1000);

      return () => clearInterval(intervalRef.current);
    }
  }, [isActive, minutes, seconds, activeTimer, completedPomodoros]);

  // Start the timer
  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
    }
  };

  // Pause the timer
  const pauseTimer = () => {
    setIsActive(false);
  };

  // Reset the timer
  const resetTimer = () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    setMinutes(TIMER_DURATIONS[activeTimer]);
    setSeconds(0);
  };

  // Switch between timer modes
  const switchTimer = (timerType) => {
    if (timerType !== activeTimer) {
      autoSwitchRef.current = false; // This is a manual switch
      setActiveTimer(timerType);
    }
  };

  return (
    <TimerContext.Provider
      value={{
        activeTimer,
        minutes,
        seconds,
        isActive,
        completedPomodoros,
        startTimer,
        pauseTimer,
        resetTimer,
        switchTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export { TimerContext, TimerProvider };
