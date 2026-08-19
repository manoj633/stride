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
import Dashboard from "./components/Dashboard/Dashboard";
import { TagManager } from "./components/TagsManager/TagManager";
import Notifications from "./components/Notifications/Notifications";

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
import {
  logout,
  clearUserInfo,
  checkTokenExpiration,
} from "./store/features/users/userSlice";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import TwoFactorVerify from "./components/TwoFactorSetup/TwoFactorVerify";
import TwoFactorSetup from "./components/TwoFactorSetup/TwoFactorSetup";
import TwoFactorSuccess from "./components/TwoFactorSetup/TwoFactorSuccess";

import ReactGA from "react-ga4";

ReactGA.initialize("G-TEK9P0HRHD"); // Replace with your ID

import AnalyticsTracker from "./utils/AnalyticsTracker";
import PrivateRoute from "./components/Common/PrivateRoute";

const App = () => {
  const { activeTimer } = useContext(TimerContext);
  const location = useLocation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { userInfo } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (
      userInfo &&
      userInfo.twoFactorAuthSetup &&
      location.pathname !== "/two-factor-setup" &&
      location.pathname !== "/two-factor-success" &&
      location.pathname !== "/login"
    ) {
      navigate("/two-factor-setup");
    }
  }, [userInfo, location.pathname, navigate]);

  useEffect(() => {
    // Keep the session alive while the app is open
    const refreshInterval = setInterval(
      () => {
        if (userInfo) {
          fetch("/api/users/refresh-token", {
            method: "POST",
            credentials: "include",
          }).catch((err) => {
            console.error("Failed to refresh token:", err);
            dispatch(logout());
            navigate("/login");
          });
        }
      },
      15 * 60 * 1000,
    ); // Check every 15 minutes

    return () => clearInterval(refreshInterval);
  }, [userInfo, dispatch, navigate]);

  useEffect(() => {
    // Check token validity on app load, then periodically
    if (dispatch(checkTokenExpiration())) {
      navigate("/login");
    }

    const expirationInterval = setInterval(
      () => {
        if (dispatch(checkTokenExpiration())) {
          navigate("/login");
        }
      },
      5 * 60 * 1000,
    ); // Check every 5 minutes

    // Stay in sync if the user logs out in another tab
    const handleStorageChange = (e) => {
      if (e.key === "userInfo" && !e.newValue) {
        dispatch(clearUserInfo());
        navigate("/login");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(expirationInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch, navigate]);

  const showNav =
    Boolean(
      userInfo &&
      !userInfo.twoFactorAuthSetup &&
      location.pathname !== "/two-factor-setup" &&
      location.pathname !== "/two-factor-success" &&
      location.pathname !== "/login" &&
      location.pathname !== "/register" &&
      location.pathname !== "/forgot-password" &&
      !location.pathname.startsWith("/reset-password")
    );

  const mainClass = `main-content ${
    showNav ? "has-mobile-topbar" : ""
  } ${location.pathname === "/pomodoro" ? activeTimer : ""}`.trim();

  return (
    <>
      <Navigation />
      <AnalyticsTracker />
      <main className={mainClass}>
        <Routes>
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <TaskCalendar />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals/:goalId"
            element={
              <PrivateRoute>
                <GoalDescription />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals/add"
            element={
              <PrivateRoute>
                <AddGoal />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <GoalList />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <PrivateRoute>
                <TaskDescription />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks/add"
            element={
              <PrivateRoute>
                <AddTask />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TaskList ownsData={true} />
              </PrivateRoute>
            }
          />
          <Route
            path="/subtasks/:subtaskId"
            element={
              <PrivateRoute>
                <SubtaskDescription />
              </PrivateRoute>
            }
          />
          <Route
            path="/subtasks/add"
            element={
              <PrivateRoute>
                <AddSubTask />
              </PrivateRoute>
            }
          />
          <Route
            path="/subtasks"
            element={
              <PrivateRoute>
                <SubtaskList ownsData={true} />
              </PrivateRoute>
            }
          />
          <Route
            path="/tags/manage"
            element={
              <PrivateRoute>
                <TagManager />
              </PrivateRoute>
            }
          />
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/two-factor-verify" element={<TwoFactorVerify />} />
          <Route path="/two-factor-setup" element={<TwoFactorSetup />} />
          <Route path="/two-factor-success" element={<TwoFactorSuccess />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </main>
      <ToastContainer />
    </>
  );
};

const RootApp = () => {
  return (
    <Provider store={store}>
      <TimerProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TimerProvider>
    </Provider>
  );
};

export default RootApp;
