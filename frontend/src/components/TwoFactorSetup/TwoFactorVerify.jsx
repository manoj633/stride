// frontend/src/components/TwoFactorVerify/TwoFactorVerify.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { validateTwoFactorAuth } from "../../store/features/users/userSlice";
import { toast } from "react-toastify";
import "./TwoFactorVerify.css";

const TwoFactorVerify = () => {
  const [token, setToken] = useState("");
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Extract email from location state passed during login
  const email = location.state?.email;

  if (!email) {
    // Redirect to login if no email is provided
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Please enter a verification code");
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(
        validateTwoFactorAuth({
          email,
          token,
          isBackupCode,
        })
      ).unwrap();

      toast.success("Authentication successful!");
      navigate("/"); // Redirect to home page after successful verification
    } catch (error) {
      toast.error(
        error?.data?.message || "Invalid verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="two-factor-verify">
      <div className="two-factor-verify__container">
        <h1 className="two-factor-verify__title">Two-Factor Authentication</h1>
        <p className="two-factor-verify__description">
          Please enter the verification code from your authenticator app.
        </p>

        <form className="two-factor-verify__form" onSubmit={handleSubmit}>
          <div className="two-factor-verify__form-group">
            <label className="two-factor-verify__label">
              {isBackupCode ? "Backup Code" : "Verification Code"}
            </label>
            <input
              className="two-factor-verify__input"
              type="text"
              placeholder={
                isBackupCode ? "Enter backup code" : "Enter 6-digit code"
              }
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="two-factor-verify__switch">
            <button
              type="button"
              className="two-factor-verify__switch-button"
              onClick={() => setIsBackupCode(!isBackupCode)}
            >
              {isBackupCode
                ? "Use authenticator app instead"
                : "Use backup code instead"}
            </button>
          </div>

          <button
            className={`two-factor-verify__button ${
              isLoading ? "two-factor-verify__button--loading" : ""
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          <div className="two-factor-verify__footer">
            <a href="/login" className="two-factor-verify__link">
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorVerify;
