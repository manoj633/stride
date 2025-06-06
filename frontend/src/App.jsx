import React, { useContext, useEffect } from "react";
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

import { useAppDispatch, useAppSelector } from "./store/hooks";
import { useNavigate } from "react-router-dom";
import { checkTokenExpiration } from "./store/features/auth/authSlice";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import TwoFactorVerify from "./components/TwoFactorSetup/TwoFactorVerify";
import TwoFactorSetup from "./components/TwoFactorSetup/TwoFactorSetup";
import TwoFactorSuccess from "./components/TwoFactorSetup/TwoFactorSuccess";

import ReactGA from "react-ga4";

ReactGA.initialize("G-TEK9P0HRHD"); // Replace with your ID

import AnalyticsTracker from "./utils/AnalyticsTracker";

const App = () => {
  const { activeTimer } = useContext(TimerContext);
  const location = useLocation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenInterval = setInterval(() => {
      // Check if user is logged in
      const { userInfo } = useAppSelector((state) => state.user);
      if (userInfo) {
        // Call your refresh token endpoint
        fetch("/api/users/refresh-token", {
          method: "POST",
          credentials: "include", // To send cookies
        }).catch((err) => {
          console.error("Failed to refresh token:", err);
          // If refresh fails, log out the user
          dispatch(logout());
          navigate("/login");
        });
      }
    }, 15 * 60 * 1000); // Check every 15 minutes

    return () => clearInterval(checkTokenInterval);
  }, []);

  useEffect(() => {
    // Listen for storage events (localStorage changes from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === "userInfo" && !e.newValue) {
        // User logged out in another tab
        dispatch(logout());
        navigate("/login");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch, navigate]);

  useEffect(() => {
    // Check token validity on app load
    const isExpired = dispatch(checkTokenExpiration());
    if (isExpired) {
      navigate("/login");
    }

    // Check token periodically
    const tokenCheckInterval = setInterval(() => {
      const isExpired = dispatch(checkTokenExpiration());
      if (isExpired) {
        navigate("/login");
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Listen for storage events (to sync across tabs)
    const handleStorageChange = (e) => {
      if (e.key === "userInfo" && !e.newValue) {
        // User logged out in another tab
        dispatch(clearCredentials());
        navigate("/login");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(tokenCheckInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch, navigate]);

  const mainClass = `main-content ${
    location.pathname === "/pomodoro" ? activeTimer : ""
  }`;

  return (
    <>
      <Navigation />
      <AnalyticsTracker />
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/two-factor-verify" element={<TwoFactorVerify />} />
          <Route path="/two-factor-setup" element={<TwoFactorSetup />} />
          <Route path="/two-factor-success" element={<TwoFactorSuccess />} />
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
