import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";

import { login } from "../../store/features/users/userSlice.js";
import { setCredentials } from "../../store/features/auth/authSlice.js";
import { toast } from "react-toastify";

import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading, error, userInfo } = useAppSelector((state) => state.user);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  // In your Login.jsx component, update the login handler
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(login({ email, password })).unwrap();

      // Check if 2FA is required
      if (res.requiresTwoFactor) {
        // Redirect to 2FA verification page with email
        navigate("/two-factor-verify", { state: { email } });
      } else {
        // No 2FA required, proceed normally
        navigate(redirect);
      }
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <div className="form-container">
      <div className="form-container__wrapper">
        <div className="form-container__content">
          <div className="login">
            <h1 className="login__title">Sign In</h1>
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
                  to={redirect ? `/register?redirect=${redirect} ` : "/"}
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
