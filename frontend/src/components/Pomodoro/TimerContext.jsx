// src/components/Pomodoro/TimerContext.jsx
import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getProfile } from "../../store/features/users/userSlice";
import { userAPI } from "../../services/api/urlService";

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
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

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

  // Synchronize completed session with backend with rollback and retry on failure
  const syncPomodoroCompletion = useCallback(async () => {
    if (!userInfo) return;
    try {
      await userAPI.completePomodoro();
      dispatch(getProfile());
      toast.success("Focus session completed! +15 XP", {
        toastId: "pomodoro-complete-success",
      });
    } catch (err) {
      console.error("Failed to log completed Pomodoro:", err);
      // Roll back optimistic increment so local counter doesn't silently drift
      setCompletedPomodoros((prev) => Math.max(0, prev - 1));
      toast.error(
        <div>
          <span>Failed to save focus session to server. </span>
          <button
            type="button"
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid #ffffff",
              color: "#ffffff",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              marginLeft: "6px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setCompletedPomodoros((prev) => prev + 1);
              syncPomodoroCompletion();
            }}
          >
            Retry
          </button>
        </div>,
        {
          toastId: "pomodoro-complete-error",
          autoClose: 8000,
        }
      );
    }
  }, [userInfo, dispatch]);

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

              // Log completed Pomodoro to backend with error handling & rollback
              if (userInfo) {
                syncPomodoroCompletion();
              }

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
  }, [isActive, minutes, seconds, activeTimer, completedPomodoros, userInfo, syncPomodoroCompletion]);

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
