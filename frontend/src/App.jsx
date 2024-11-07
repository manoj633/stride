import React from "react";
import Navigation from "./components/Navigation/Navigation";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GoalList from "./components/GoalList/GoalList";

const App = () => {
  return (
    <BrowserRouter>
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/goals" Component={GoalList} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;
