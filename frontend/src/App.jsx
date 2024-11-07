import React from "react";
import Navigation from "./components/Navigation/Navigation";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const App = () => {
  return (
    <BrowserRouter>
      <Navigation />
      <main className="main-content">
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
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
