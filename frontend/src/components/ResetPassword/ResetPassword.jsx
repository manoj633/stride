// frontend/src/components/ResetPassword/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success("Password reset successful!");
      navigate("/login");
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) return <LoadingSpinner message="Resetting password..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="reset-password">
      <div className="reset-password__container">
        <h1 className="reset-password__title">Create New Password</h1>

        <form className="reset-password__form" onSubmit={handleSubmit}>
          <div className="reset-password__form-group">
            <label className="reset-password__label">New Password</label>
            <input
              className="reset-password__input"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="New password"
            />
          </div>

          <div className="reset-password__form-group">
            <label className="reset-password__label">Confirm Password</label>
            <input
              className="reset-password__input"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-label="Confirm new password"
            />
          </div>

          <button
            className={`reset-password__button ${
              isSubmitting ? "reset-password__button--loading" : ""
            }`}
            type="submit"
            disabled={isSubmitting}
            aria-label="Reset password"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
