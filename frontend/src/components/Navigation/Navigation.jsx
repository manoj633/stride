import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import { logout } from "../../store/features/users/userSlice.js";
import "./Navigation.css";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.user);

  const logoutHandler = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Calendar" },
    {
      path: "/goals",
      label: "Goals",
      children: [
        { path: "/goals/add", label: "Add Goal" },
        { path: "/goals/", label: "View Goals" },
      ],
    },
    {
      path: "/tasks",
      label: "Tasks",
      children: [
        { path: "/tasks/add", label: "Add Task" },
        { path: "/tasks/", label: "View Tasks" },
      ],
    },
    {
      path: "/subtasks",
      label: "Subtasks",
      children: [
        { path: "/subtasks/add", label: "Add Subtask" },
        { path: "/subtasks/", label: "View Subtasks" },
      ],
    },
    { path: "/tags/manage", label: "Tags" },
  ];

  return (
    <nav className={`modern-nav ${isScrolled ? "modern-nav--scrolled" : ""}`}>
      <div className="modern-nav__container">
        <div className="modern-nav__logo">
          <NavLink to="/" className="modern-nav__logo-link">
            Stride
          </NavLink>
        </div>

        <button
          className="modern-nav__mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div
          className={`modern-nav__menu ${
            isMobileMenuOpen ? "modern-nav__menu--open" : ""
          }`}
        >
          {navLinks.map(({ path, label, children }) => (
            <div key={path} className="modern-nav__item">
              {children ? (
                <div className="modern-nav__dropdown">
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `modern-nav__link ${
                        isActive ? "modern-nav__link--active" : ""
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {label}
                  </NavLink>
                  <div className="modern-nav__dropdown-content">
                    {children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className="modern-nav__dropdown-item"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `modern-nav__link ${
                      isActive ? "modern-nav__link--active" : ""
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </NavLink>
              )}
            </div>
          ))}
          {userInfo ? (
            <div className="modern-nav__user">
              <span className="modern-nav__user-name">{userInfo.name}</span>
              <div className="modern-nav__user-dropdown">
                <NavLink to="/profile" className="modern-nav__dropdown-item">
                  Profile
                </NavLink>
                <button
                  className="modern-nav__dropdown-item"
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <NavLink to="/login" className="modern-nav__link">
              <FaUser /> Sign In
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
