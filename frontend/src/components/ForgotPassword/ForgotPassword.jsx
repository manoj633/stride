// frontend/src/components/ForgotPassword/ForgotPassword.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { logout } from "../../store/features/users/userSlice";

import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      dispatch(logout());

      setEmailSent(true);
      toast.success("Password reset email sent successfully!");
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) return <LoadingSpinner message="Sending reset email..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="forgot-password">
      <div className="forgot-password__container">
        <h1 className="forgot-password__title">Reset Your Password</h1>

        {emailSent ? (
          <div className="forgot-password__success">
            <p>
              If an account exists with the email you entered, we've sent
              password reset instructions to that address.
            </p>
            <p>Please check your inbox and follow the link in the email.</p>
          </div>
        ) : (
          <form className="forgot-password__form" onSubmit={handleSubmit}>
            <div className="forgot-password__form-group">
              <label className="forgot-password__label">Email Address</label>
              <input
                className="forgot-password__input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address for password reset"
              />
            </div>

            <button
              className={`forgot-password__button ${
                isSubmitting ? "forgot-password__button--loading" : ""
              }`}
              type="submit"
              disabled={isSubmitting}
              aria-label="Send password reset link"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="forgot-password__footer">
              <a href="/login" className="forgot-password__link">
                Back to Login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
