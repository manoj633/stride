import React, { useContext, useState } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { store } from "./store/store";
import Navigation from "./components/Navigation/Navigation";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import GoalList from "./components/GoalList/GoalList";
import AddGoal from "./components/AddGoal/AddGoal";
import GoalDescription from "./components/GoalDescription/GoalDescription";
import TaskList from "./components/TaskList/TaskList";
import AddTask from "./components/AddTask/AddTask";
import TaskDescription from "./components/TaskDescription/TaskDescription";
import SubtaskList from "./components/SubtaskList/SubtaskList";
import AddSubTask from "./components/AddSubTask/AddSubTask";
import SubtaskDescription from "./components/SubtaskDescription/SubtaskDescription";
import TaskCalendar from "./components/TaskCalendar/TaskCalendar";
import { TagManager } from "./components/TagsManager/TagManager";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Profile from "./components/Profile/Profile";
import Pomodoro from "./components/Pomodoro/Pomodoro";
import {
  TimerContext,
  TimerProvider,
} from "./components/Pomodoro/TimerContext";

const App = () => {
  const { activeTimer } = useContext(TimerContext);
  const location = useLocation();

  const mainClass = `main-content ${
    location.pathname === "/pomodoro" ? activeTimer : ""
  }`;

  return (
    <>
      <Navigation />
      <main className={mainClass}>
        <Routes>
          <Route path="/" Component={TaskCalendar} />
          <Route path="/goals/:goalId" Component={GoalDescription} />
          <Route path="/goals/add" Component={AddGoal} />
          <Route path="/goals" Component={GoalList} />
          <Route path="/tasks/:taskId" Component={TaskDescription} />
          <Route path="/tasks/add" Component={AddTask} />
          <Route path="/tasks" Component={TaskList} />
          <Route path="/subtasks/:subtaskId" Component={SubtaskDescription} />
          <Route path="/subtasks/add" Component={AddSubTask} />
          <Route path="/subtasks" Component={SubtaskList} />
          <Route path="/tags/manage" Component={TagManager} />
          <Route path="/login" Component={Login} />
          <Route path="/register" Component={Register} />
          <Route path="/profile" Component={Profile} />
          <Route path="/pomodoro" Component={Pomodoro} />
        </Routes>
      </main>
      <ToastContainer />
    </>
  );
};

const RootApp = () => {
  return (
    <TimerProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </TimerProvider>
  );
};

export default RootApp;
