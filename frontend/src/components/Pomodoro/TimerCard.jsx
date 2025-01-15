// components/TimerCard.js
import React, { useState, useEffect, useContext } from "react";
import TimerButton from "./TimerButton"; // Assuming you create this for the Start/Pause button
import "./TimerCard.css";
import { TimerContext } from "./TimerContext";
import SettingsIcon from "@mui/icons-material/Settings";
import Modal from "react-modal";

const TIMER_STATES = {
  POMODORO: "pomodoro",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak",
};

const TimerCard = ({ onPomodoroComplete }) => {
  const { activeTimer, setActiveTimer } = useContext(TimerContext);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);

  const [customDurations, setCustomDurations] = useState({
    [TIMER_STATES.POMODORO]: localStorage.getItem(TIMER_STATES.POMODORO)
      ? parseInt(localStorage.getItem(TIMER_STATES.POMODORO), 10)
      : 25,
    [TIMER_STATES.SHORT_BREAK]: localStorage.getItem(TIMER_STATES.SHORT_BREAK)
      ? parseInt(localStorage.getItem(TIMER_STATES.SHORT_BREAK), 10)
      : 5,
    [TIMER_STATES.LONG_BREAK]: localStorage.getItem(TIMER_STATES.LONG_BREAK)
      ? parseInt(localStorage.getItem(TIMER_STATES.LONG_BREAK), 10)
      : 15,
  });

  const handleTimerSelection = (timerType) => {
    setActiveTimer(timerType);
    setSecondsRemaining(customDurations[timerType] * 60); // Set seconds from minutes
    setIsRunning(false);
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setSecondsRemaining(customDurations[activeTimer] * 60);
    setIsRunning(false);
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const handleDurationChange = (timerType, newDuration) => {
    // Clear input when empty
    if (newDuration === "") {
      newDuration = 0;
    } else {
      // Convert to a number (or 0 if NaN)
      newDuration = parseInt(newDuration, 10) || 0;
    }

    // Enforce range (1-60)
    newDuration = Math.max(1, Math.min(60, newDuration));

    setCustomDurations((prevDurations) => {
      const updatedDurations = {
        ...prevDurations,
        [timerType]: newDuration,
      };
      // Save to localStorage
      localStorage.setItem(timerType, updatedDurations[timerType]);
      return updatedDurations;
    });
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
    return `${minutes}:${remainingSeconds}`; // Added missing template literal
  };

  Modal.setAppElement("#root");
  return (
    <div className="timer-card-container">
      <div className={`timer-card ${activeTimer}`}>
        <div className="settings-icon" onClick={openModal}>
          <SettingsIcon />
        </div>

        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Timer Settings"
          className="settings-modal"
          overlayClassName="settings-modal-overlay"
        >
          <div className="settings-content">
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            <h2>Settings</h2>
            {Object.entries(TIMER_STATES).map(([key, timerType]) => (
              <div key={key} className="setting-item">
                <label htmlFor={`${timerType}-duration`}>{timerType}: </label>
                <input
                  type="number"
                  id={`${timerType}-duration`}
                  value={customDurations[timerType]}
                  onChange={(e) =>
                    handleDurationChange(timerType, e.target.value)
                  }
                />
                <span>minutes</span>
              </div>
            ))}
          </div>
        </Modal>
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
