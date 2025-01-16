// components/TimerCard.js
import React, { useState, useEffect, useContext } from "react";
import TimerButton from "./TimerButton";
import "./TimerCard.css";
import { TimerContext } from "./TimerContext";
import SettingsIcon from "@mui/icons-material/Settings";
import Modal from "react-modal";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";

const TIMER_STATES = {
  POMODORO: "pomodoro",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak",
};

const TimerCard = () => {
  const { activeTimer, setActiveTimer } = useContext(TimerContext);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);

  // State for pomodoro cycle and count
  const [pomodoroCycle, setPomodoroCycle] = useState(1);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

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

  const chartRef = React.useRef(null);

  const colors = {
    pomodoro: {
      elapsed: am5.color(0xcd5c5c), // Indian Red
      remaining: am5.color(0xffa07a), // Light Salmon
    },
    shortBreak: {
      elapsed: am5.color(0x117a8b), // Dark Cyan
      remaining: am5.color(0x5bc0de), // Light Cyan
    },
    longBreak: {
      elapsed: am5.color(0x556b2f), // Dark Olive
      remaining: am5.color(0x9acd32), // Yellow Green
    },
  };

  useEffect(() => {
    // Create amCharts instance
    const root = am5.Root.new("chartdiv");

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        innerRadius: am5.percent(80),
        startAngle: -90,
        endAngle: 270,
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
      })
    );

    series.data.setAll([
      { category: "Elapsed", value: 0 },
      { category: "Remaining", value: 100 },
    ]);

    series.slices.template.setAll({
      cornerRadius: 10,
    });

    series.labels.template.set("forceHidden", true);

    series.slices.template.set("tooltipText", "");

    series.slices.template.states.create("hover", {
      scale: 1.1,
    });

    series.slices.template.adapters.add("fill", (fill, target) => {
      return target.dataItem.get("category") === "Elapsed"
        ? colors[activeTimer].elapsed
        : colors[activeTimer].remaining;
    });

    chartRef.current = { root, chart, series };

    return () => root.dispose();
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      const { series } = chartRef.current;
      const elapsedPercentage =
        100 - (secondsRemaining / (customDurations[activeTimer] * 60)) * 100;

      series.data.setAll([
        { category: "Elapsed", value: elapsedPercentage },
        { category: "Remaining", value: 100 - elapsedPercentage },
      ]);
    }
  }, [secondsRemaining, customDurations, activeTimer]);

  useEffect(() => {
    setSecondsRemaining(customDurations[activeTimer] * 60);
  }, [customDurations, activeTimer]);

  const handleTimerSelection = (timerType) => {
    setActiveTimer(timerType);
    if (chartRef.current) {
      const { series } = chartRef.current;
      series.slices.template.adapters.add("fill", (fill, target) => {
        return target.dataItem.get("category") === "Elapsed"
          ? colors[timerType].elapsed
          : colors[timerType].remaining;
      });
    }

    setSecondsRemaining(customDurations[timerType] * 60);
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
    if (newDuration === "") {
      newDuration = 0;
    } else {
      newDuration = parseInt(newDuration, 10) || 0;
    }

    newDuration = Math.max(1, Math.min(60, newDuration));

    setCustomDurations((prevDurations) => {
      const updatedDurations = {
        ...prevDurations,
        [timerType]: newDuration,
      };
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
      if (secondsRemaining === 0) {
        // Handle timer completion
        handleTimerComplete();
      }
    }
    return () => clearInterval(intervalId);
  }, [isRunning, secondsRemaining, activeTimer]);

  const handleTimerComplete = () => {
    if (activeTimer === TIMER_STATES.POMODORO) {
      setPomodorosCompleted(pomodorosCompleted + 1);
      if (pomodoroCycle < 4) {
        // Move to short break
        setActiveTimer(TIMER_STATES.SHORT_BREAK);
        setSecondsRemaining(customDurations[TIMER_STATES.SHORT_BREAK] * 60);
        setPomodoroCycle(pomodoroCycle + 1);
      } else {
        // Move to long break
        setActiveTimer(TIMER_STATES.LONG_BREAK);
        setSecondsRemaining(customDurations[TIMER_STATES.LONG_BREAK] * 60);
        setPomodoroCycle(1); // Reset cycle
      }
    } else {
      // If coming from a break, move to pomodoro
      setActiveTimer(TIMER_STATES.POMODORO);
      setSecondsRemaining(customDurations[TIMER_STATES.POMODORO] * 60);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
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
                  min="1"
                  value={customDurations[timerType]}
                  onChange={(e) =>
                    handleDurationChange(timerType, e.target.value)
                  }
                />
                <span>minutes</span>
              </div>
            ))}
            <div className="modal-buttons">
              <button
                onClick={closeModal}
                className="modal-button cancel-button"
              >
                {" "}
                Close
              </button>
              <button onClick={closeModal} className="modal-button ok-button">
                {" "}
                OK
              </button>
            </div>
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
          <div id="chartdiv" style={{ width: "100%", height: "300px" }}></div>
          <div className="timer-display">{formatTime(secondsRemaining)}</div>
        </div>
        <div className="timer-card__controls">
          <TimerButton
            isRunning={isRunning}
            onStartPause={handleStartPause}
            onReset={handleReset}
          />
        </div>
      </div>
      <div className="pomodoro-count">
        Pomodoros Completed: {pomodorosCompleted}
      </div>
    </div>
  );
};

export default TimerCard;
