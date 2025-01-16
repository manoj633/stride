import React, { useContext, useState } from "react";
import TimerCard from "./TimerCard";
import "./Pomodoro.css"; // Import a CSS file for styling this component

const Pomodoro = () => {
  return (
    <div className="pomodoro-container">
      <TimerCard />
    </div>
  );
};

export default Pomodoro;
