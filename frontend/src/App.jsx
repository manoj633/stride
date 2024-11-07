import React from "react";
import Navigation from "./components/Navigation/Navigation";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GoalList from "./components/GoalList/GoalList";
import AddGoal from "./components/AddGoal/AddGoal";
import GoalDescription from "./components/GoalDescription/GoalDescription";
import TaskList from "./components/TaskList/TaskList";
import AddTask from "./components/AddTask/AddTask";

const App = () => {
  return (
    <BrowserRouter>
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/goals/:goalId" Component={GoalDescription} />
          <Route path="/goals/add" Component={AddGoal} />
          <Route path="/goals" Component={GoalList} />
          <Route path="/tasks/add" Component={AddTask} />
          <Route path="/tasks" Component={TaskList} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
