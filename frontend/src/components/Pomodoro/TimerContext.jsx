// src/TimerContext.js
import React, { createContext, useState } from "react";

const TIMER_STATES = {
  POMODORO: "pomodoro",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak",
};

const TimerContext = createContext();

const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(TIMER_STATES.POMODORO);

  return (
    <TimerContext.Provider value={{ activeTimer, setActiveTimer }}>
      {children}
    </TimerContext.Provider>
  );
};

export { TimerContext, TimerProvider };
