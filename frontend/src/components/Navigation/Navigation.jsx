// src/components/Navigation/NavigationDrawer.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/features/users/userSlice";
import {
  FiHome,
  FiTarget,
  FiCheckSquare,
  FiList,
  FiCalendar,
  FiClock,
  FiTag,
  FiUser,
  FiPlusCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "./Navigation.css";

const NavigationDrawer = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { userInfo } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const closeDrawer = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  if (!userInfo) {
    return null; // Don't show nav when not logged in
  }

  const mainNavItems = [
    { path: "/", label: "Dashboard", icon: <FiHome /> },
    { path: "/goals", label: "Goals", icon: <FiTarget /> },
    { path: "/tasks", label: "Tasks", icon: <FiCheckSquare /> },
    { path: "/subtasks", label: "Subtasks", icon: <FiList /> },
    { path: "/calendar", label: "Calendar", icon: <FiCalendar /> },
    { path: "/pomodoro", label: "Pomodoro", icon: <FiClock /> },
    { path: "/tags/manage", label: "Tags", icon: <FiTag /> },
    { path: "/profile", label: "Profile", icon: <FiUser /> },
  ];

  const quickAddItems = [
    { path: "/goals/add", label: "Add Goal", color: "#4285f4" },
    { path: "/tasks/add", label: "Add Task", color: "#34a853" },
    { path: "/subtasks/add", label: "Add Subtask", color: "#fbbc05" },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <button className="nav-drawer__toggle" onClick={toggleDrawer}>
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      )}

      {/* Collapse/Expand button for desktop */}
      {!isMobile && (
        <button
          className={`nav-drawer__collapse-btn ${isOpen ? "" : "collapsed"}`}
          onClick={toggleDrawer}
        >
          {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
        </button>
      )}

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div className="nav-drawer__backdrop" onClick={closeDrawer}></div>
      )}

      {/* Main navigation drawer */}
      <nav className={`nav-drawer ${isOpen ? "open" : "closed"}`}>
        <div className="nav-drawer__header">
          <h1 className="nav-drawer__title">Stride</h1>
          {isMobile && (
            <button className="nav-drawer__close" onClick={closeDrawer}>
              <FiX size={20} />
            </button>
          )}
        </div>

        <div className="nav-drawer__user">
          <div className="nav-drawer__avatar">
            {userInfo?.name?.charAt(0)?.toUpperCase() || ""}
          </div>
          {isOpen && (
            <div className="nav-drawer__user-info">
              <div className="nav-drawer__username">{userInfo.name}</div>
              <div className="nav-drawer__email">{userInfo.email}</div>
            </div>
          )}
        </div>

        {/* Quick add section */}
        {isOpen && (
          <div className="nav-drawer__quick-add">
            {quickAddItems.map((item) => (
              <button
                key={item.path}
                className="nav-drawer__quick-add-btn"
                style={{ backgroundColor: item.color }}
                onClick={() => {
                  navigate(item.path);
                  closeDrawer();
                }}
              >
                <FiPlusCircle size={16} />
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Main navigation links */}
        <ul className="nav-drawer__links">
          {mainNavItems.map((item) => (
            <li key={item.path}>
              <a
                href={item.path}
                className={`nav-drawer__link ${
                  isActive(item.path) ? "active" : ""
                } ${!isOpen ? "collapsed" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  closeDrawer();
                }}
                title={!isOpen ? item.label : ""}
              >
                <span className="nav-drawer__icon">{item.icon}</span>
                {isOpen && (
                  <span className="nav-drawer__label">{item.label}</span>
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-drawer__footer">
          <button
            className={`nav-drawer__logout ${!isOpen ? "collapsed" : ""}`}
            onClick={handleLogout}
            title={!isOpen ? "Logout" : ""}
          >
            <FiLogOut />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </nav>

      {/* Main content class helper */}
      <div
        className={`main-content-wrapper ${
          isOpen ? "drawer-open" : "drawer-closed"
        }`}
      ></div>
    </>
  );
};

export default NavigationDrawer;
