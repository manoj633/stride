import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { register } from "../../store/features/users/userSlice.js";
import { toast } from "react-toastify";
import "./Register.css";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await dispatch(register({ name, email, password })).unwrap();
      if (res.twoFactorAuthSetup) {
        navigate("/two-factor-setup");
      } else {
        navigate(redirect);
      }
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  if (loading) return <LoadingSpinner message="Registering..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="register">
      <div className="register__container">
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
          <a
            href={redirect ? `/login?redirect=${redirect}` : "/login"}
            className="register__link"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
