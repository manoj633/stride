import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Navigation.css";
import { useAppSelector, useAppDispatch } from "../../store/hooks.js";
import { logout } from "../../store/features/users/userSlice.js";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { loading, error, userInfo } = useAppSelector((state) => state.user);

  const logoutHandler = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
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
    { path: "/goals", label: "Goals" },
    { path: "/tasks", label: "Tasks" },
    { path: "/subtasks", label: "Subtasks" },
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
          {navLinks.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `nav__link ${isActive ? "nav__link--active" : ""}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {label}
            </NavLink>
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
