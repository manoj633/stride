import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { register } from "../../store/features/users/userSlice.js";
import { userAPI } from "../../services/api/urlService.js";
import { toast } from "react-toastify";
import "./Register.css";
import LoadingSpinner from "../Common/LoadingSpinner";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading, userInfo } = useAppSelector((state) => state.user);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      if (userInfo.twoFactorAuthSetup) {
        navigate("/two-factor-setup");
      } else {
        navigate(redirect);
      }
    }
  }, [userInfo, redirect, navigate]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await dispatch(register({ name, email, password })).unwrap();
      if (res && res.isEmailVerified === false) {
        setRegisteredEmail(email);
        setVerificationSent(true);
        toast.success(
          res.message || "Account registered! Please check your email to verify."
        );
      } else if (res?.twoFactorAuthSetup) {
        navigate("/two-factor-setup");
      } else {
        navigate(redirect);
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || error || "Registration failed");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending || !registeredEmail) return;
    setResending(true);
    try {
      const res = await userAPI.resendVerification(registeredEmail);
      toast.success(res.data?.message || "Verification email resent!");
      setResendCooldown(60);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  if (loading) return <LoadingSpinner message="Registering account..." />;

  return (
    <div className="register">
      <div className="register__container">
        {verificationSent ? (
          <div className="register__verify-card">
            <div className="register__verify-icon-wrapper">
              <svg
                className="register__verify-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h1 className="register__verify-title">Check Your Email</h1>
            <p className="register__verify-text">
              We've sent a verification link to <strong>{registeredEmail}</strong>.
            </p>
            <p className="register__verify-subtext">
              Please click the link in your email to activate your account. You will not be able to log in until your email is verified.
            </p>

            <div className="register__verify-actions">
              <button
                type="button"
                className="register__verify-resend-btn"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
              >
                {resending
                  ? "Sending link..."
                  : resendCooldown > 0
                  ? `Resend link in ${resendCooldown}s`
                  : "Resend verification link"}
              </button>
              <Link to="/login" className="register__verify-login-btn">
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="register__title">Sign Up</h1>
            <form className="register__form" onSubmit={submitHandler}>
              <div className="register__form-group">
                <label className="register__label">Name</label>
                <input
                  className="register__input"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label="Name"
                  required
                />
              </div>

              <div className="register__form-group">
                <label className="register__label">Email Address</label>
                <input
                  className="register__input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                  required
                />
              </div>

              <div className="register__form-group">
                <label className="register__label">Password</label>
                <input
                  className="register__input"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Password"
                  required
                />
              </div>

              <div className="register__form-group">
                <label className="register__label">Confirm Password</label>
                <input
                  className="register__input"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-label="Confirm password"
                  required
                />
              </div>

              <button
                className={`register__button ${
                  loading ? "register__button--loading" : ""
                }`}
                type="submit"
                disabled={loading}
                aria-label="Register new account"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <div className="register__footer">
              Already have an account?{" "}
              <Link
                to={redirect ? `/login?redirect=${redirect}` : "/login"}
                className="register__link"
              >
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
