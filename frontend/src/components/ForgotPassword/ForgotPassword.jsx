// frontend/src/components/ForgotPassword/ForgotPassword.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/features/users/userSlice";

import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (useBackupCode) {
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        setIsSubmitting(false);
        return;
      }
      try {
        const response = await fetch("/api/users/recover-with-backup-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, backupCode, newPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Recovery failed");
        }

        dispatch(logout());
        toast.success("Password reset successfully. Please login.");
        navigate("/login");
      } catch (error) {
        setBackupCode("");
        toast.error(error.message || "Invalid backup code");
      } finally {
        setIsSubmitting(false);
      }
    } else {
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
        toast.error(error.message || "Failed to send reset link");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isSubmitting) return <LoadingSpinner message={useBackupCode ? "Resetting password..." : "Sending reset email..."} />;
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

            {useBackupCode && (
              <>
                <div className="forgot-password__form-group">
                  <label className="forgot-password__label">Backup Code</label>
                  <input
                    className="forgot-password__input"
                    type="text"
                    placeholder="Enter backup code"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    required
                    aria-label="2FA backup code"
                  />
                </div>

                <div className="forgot-password__form-group">
                  <label className="forgot-password__label">New Password</label>
                  <input
                    className="forgot-password__input"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    aria-label="New password"
                  />
                </div>

                <div className="forgot-password__form-group">
                  <label className="forgot-password__label">Confirm New Password</label>
                  <input
                    className="forgot-password__input"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    aria-label="Confirm new password"
                  />
                </div>
              </>
            )}

            <div className="forgot-password__switch">
              <button
                type="button"
                className="forgot-password__switch-button"
                onClick={() => setUseBackupCode(!useBackupCode)}
                aria-label={
                  useBackupCode
                    ? "Switch to email reset"
                    : "Switch to backup code recovery"
                }
              >
                {useBackupCode
                  ? "Send reset email instead"
                  : "Use 2FA backup code instead"}
              </button>
            </div>

            <button
              className={`forgot-password__button ${
                isSubmitting ? "forgot-password__button--loading" : ""
              }`}
              type="submit"
              disabled={isSubmitting}
              aria-label={useBackupCode ? "Reset Password" : "Send password reset link"}
            >
              {isSubmitting ? "Processing..." : useBackupCode ? "Reset Password" : "Send Reset Link"}
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
