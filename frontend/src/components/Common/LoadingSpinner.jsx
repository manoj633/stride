import React from "react";
import { FaSpinner } from "react-icons/fa";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="loading-spinner">
    <FaSpinner className="loading-spinner__icon" spin="true" />
    <span className="loading-spinner__text">{message}</span>
  </div>
);

export default LoadingSpinner;
