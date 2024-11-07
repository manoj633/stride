// src/components/Navigation/Navigation.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  return (
    <nav className="nav">
      <div className="nav__container">
        <div className="nav__logo">
          <NavLink to="/goals" className="nav__logo-link">
            Stride
          </NavLink>
        </div>

        <div className="nav__menu">
          <NavLink
            to="/goals"
            className={({ isActive }) =>
              `nav__link ${isActive ? "nav__link--active" : ""}`
            }
          >
            Goals
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `nav__link ${isActive ? "nav__link--active" : ""}`
            }
          >
            Tasks
          </NavLink>

          <NavLink
            to="/subtasks"
            className={({ isActive }) =>
              `nav__link ${isActive ? "nav__link--active" : ""}`
            }
          >
            Subtasks
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
