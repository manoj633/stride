// src/components/Navigation/NavigationDrawer.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/features/users/userSlice";
import {
  FiHome,
  FiTarget,
  FiCheckSquare,
  FiList,
  FiCalendar,
  FiClock,
  FiAward,
  FiTag,
  FiUser,
  FiShield,
  FiPlusCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "./Navigation.css";
import NotificationBell from "../Notifications/NotificationBell";

const NavigationDrawer = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const { userInfo } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    let prevIsMobile = window.innerWidth < 1024;
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile !== prevIsMobile) {
        setIsOpen(!mobile);
        prevIsMobile = mobile;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [location.pathname]);

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

  if (
    !userInfo ||
    userInfo.twoFactorAuthSetup ||
    location.pathname === "/two-factor-setup" ||
    location.pathname === "/two-factor-success"
  ) {
    return null; // Don't show nav when not logged in or during 2FA setup/success
  }

  const mainNavItems = [
    { path: "/", label: "Dashboard", icon: <FiHome /> },
    { path: "/goals", label: "Goals", icon: <FiTarget /> },
    { path: "/tasks", label: "Tasks", icon: <FiCheckSquare /> },
    { path: "/subtasks", label: "Subtasks", icon: <FiList /> },
    { path: "/calendar", label: "Calendar", icon: <FiCalendar /> },
    { path: "/pomodoro", label: "Pomodoro", icon: <FiClock /> },
    { path: "/year-in-review", label: "Year in Review", icon: <FiAward /> },
    { path: "/tags/manage", label: "Tags", icon: <FiTag /> },
    { path: "/profile", label: "Profile", icon: <FiUser /> },
    ...(userInfo?.isAdmin
      ? [{ path: "/admin", label: "Admin", icon: <FiShield /> }]
      : []),
  ];

  const quickAddItems = [
    { path: "/goals/add", label: "Add Goal", color: "#4285f4" },
    { path: "/tasks/add", label: "Add Task", color: "#34a853" },
    { path: "/subtasks/add", label: "Add Subtask", color: "#fbbc05" },
  ];

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <header className="mobile-topbar">
        <button
          className="mobile-topbar__menu-btn"
          onClick={toggleDrawer}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
        <div className="mobile-topbar__brand" onClick={() => { navigate("/"); closeDrawer(); }}>
          <span className="mobile-topbar__logo">Stride</span>
        </div>
        <div className="mobile-topbar__actions">
          <NotificationBell />
          <button
            className="mobile-topbar__avatar"
            onClick={() => { navigate("/profile"); closeDrawer(); }}
            aria-label="View profile"
          >
            {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
          </button>
        </div>
      </header>

      {/* Collapse/Expand button for desktop */}
      {!isMobile && (
        <button
          className={`nav-drawer__collapse-btn ${isOpen ? "" : "collapsed"}`}
          onClick={toggleDrawer}
          aria-label={
            isOpen ? "Collapse navigation drawer" : "Expand navigation drawer"
          }
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
          <NotificationBell />
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
                aria-label={item.label}
                role="menuitem"
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
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-drawer__link ${isActive ? "active" : ""} ${!isOpen ? "collapsed" : ""}`
                }
                onClick={(e) => {
                  closeDrawer();
                }}
                title={!isOpen ? item.label : ""}
              >
                <span className="nav-drawer__icon">{item.icon}</span>
                {isOpen && (
                  <span className="nav-drawer__label">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-drawer__footer">
          <button
            className={`nav-drawer__logout ${!isOpen ? "collapsed" : ""}`}
            title={!isOpen ? "Logout" : ""}
            onClick={handleLogout}
            aria-label="Log out"
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
