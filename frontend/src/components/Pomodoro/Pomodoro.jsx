import React, { useContext, useState } from "react";
import TimerCard from "./TimerCard";
import "./Pomodoro.css"; // Import a CSS file for styling this component
import { TimerContext } from "./TimerContext";

const Pomodoro = () => {
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const { activeTimer } = useContext(TimerContext);
  return (
    <div className="pomodoro-container">
      <TimerCard
        onPomodoroComplete={() => setPomodorosCompleted(pomodorosCompleted + 1)}
      />
    </div>
  );
};

export default Pomodoro;
