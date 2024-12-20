import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navigation.css";
import { FaUser } from "react-icons/fa";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import { logout } from "../../store/features/users/userSlice.js";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, userInfo } = useAppSelector((state) => state.user);

  const logoutHandler = async () => {
    try {
      await dispatch(logout()).unwrap();
      setIsDropdownOpen(false);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  // Handle scroll effect
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
    <nav className={`nav ${isScrolled ? "nav--scrolled" : ""}`}>
      <div className="nav__container">
        <div className="nav__logo">
          <NavLink to="/" className="nav__logo-link">
            Stride
          </NavLink>
        </div>

        <button
          className="nav__mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div
          className={`nav__menu ${isMobileMenuOpen ? "nav__menu--open" : ""}`}
        >
          {navLinks.map(({ path, label, children }) => (
            <div key={path} className="nav__item">
              {children ? (
                <div className="nav__dropdown">
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `nav__link ${isActive ? "nav__link--active" : ""}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {label}
                  </NavLink>
                  <div className="nav__dropdown-content">
                    {children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className="nav__dropdown-item"
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
                    `nav__link ${isActive ? "nav__link--active" : ""}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </NavLink>
              )}
            </div>
          ))}
          {userInfo ? (
            <div className="nav__user-dropdown">
              <button
                className="nav__user-dropdown-toggle"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {userInfo.name}
              </button>
              {isDropdownOpen && (
                <div className="nav__user-dropdown-menu">
                  <NavLink
                    to="/profile"
                    className="nav__user-dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <button
                    className="nav__user-dropdown-item"
                    onClick={logoutHandler}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="nav__link">
              <FaUser /> Sign In
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
