import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";

import { login } from "../../store/features/users/userSlice.js";
import { userAPI } from "../../services/api/urlService.js";
import { toast } from "react-toastify";

import LoadingSpinner from "../Common/LoadingSpinner";

import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unverifiedWarning, setUnverifiedWarning] = useState(null);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading, userInfo } = useAppSelector((state) => state.user);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setUnverifiedWarning(null);
    try {
      const res = await dispatch(login({ email, password })).unwrap();

      // Check if 2FA setup is required (user verified email, but hasn't completed 2FA setup yet)
      if (res.requiresTwoFactorSetup && res.twoFactorAuthSetup) {
        navigate("/two-factor-setup", {
          state: {
            qrCodeUrl: res.twoFactorAuthSetup.qrCodeUrl,
            secret: res.twoFactorAuthSetup.secret,
            setupToken: res.setupToken,
            email,
          },
        });
      } else if (res.requiresTwoFactor) {
        // Returning user with 2FA enabled
        navigate("/two-factor-verify", { state: { email } });
      } else {
        navigate(redirect);
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || err || "Login failed";
      if (typeof msg === "string" && msg.toLowerCase().includes("verify your email")) {
        setUnverifiedWarning(msg);
      }
      toast.error(typeof msg === "string" ? msg : "Login failed");
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address above.");
      return;
    }
    setResending(true);
    try {
      const res = await userAPI.resendVerification(email.trim());
      toast.success(res.data?.message || "Verification email sent!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  if (loading) return <LoadingSpinner message="Logging in..." />;

  return (
    <div className="form-container">
      <div className="form-container__wrapper">
        <div className="form-container__content">
          <div className="login">
            <h1 className="login__title">Sign In</h1>

            {unverifiedWarning && (
              <div className="login__unverified-banner">
                <p className="login__unverified-banner-text">
                  {unverifiedWarning}
                </p>
                <button
                  type="button"
                  className="login__unverified-banner-btn"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? "Sending link..." : "Resend Verification Email"}
                </button>
              </div>
            )}

            <form className="login__form" onSubmit={submitHandler}>
              <div className="login__form-group">
                <label htmlFor="email" className="login__label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="login__input"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                  required
                />
              </div>
              <div className="login__form-group">
                <label htmlFor="password" className="login__label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="login__input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Password"
                  required
                />
              </div>
              <button
                type="submit"
                className="login__button"
                disabled={loading}
                aria-label="Sign in to your account"
              >
                Sign In
              </button>
            </form>
            <div className="login__footer">
              <span className="login__footer-text">
                New Customer?{" "}
                <Link
                  to={redirect ? `/register?redirect=${redirect}` : "/register"}
                  className="login__link"
                >
                  Register
                </Link>
              </span>
              <span className="login__footer-text">
                <Link to="/forgot-password" className="login__link">
                  Forgot Password?
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
