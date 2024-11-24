import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();
    console.log("submit");
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
                />
              </div>
              <button type="submit" className="login__button">
                Sign In
              </button>
            </form>
            <div className="login__footer">
              <span className="login__footer-text">
                New Customer?{" "}
                <Link to="/register" className="login__link">
                  Register
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
