import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { toast } from "react-toastify";
import { updateProfile } from "../../store/features/users/userSlice.js";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, userInfo } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (userInfo) {
      console.log(userInfo);
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await dispatch(
        updateProfile({
          _id: userInfo._id,
          name,
          email,
          password,
        })
      ).unwrap();
      toast.success("Profile updated successfully");
      navigate(-1);
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  return (
    <div className="profile">
      <div className="profile__container">
        <div className="profile__sidebar">
          <div className="profile__header">
            <div className="profile__avatar">
              {userInfo?.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile__header-info">
              <h2 className="profile__title">User Profile </h2>
              <p className="profile__subtitle">Manage your account settings</p>
            </div>
            {userInfo?.isAdmin && (
              <span className="profile__admin-badge">Admin Account</span>
            )}
          </div>

          <form className="profile__form" onSubmit={submitHandler}>
            <div className="profile__form-group">
              <label className="profile__label">
                <span className="profile__label-text">Name</span>
                <div className="profile__input-wrapper">
                  <input
                    className="profile__input"
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <span className="profile__input-icon">👤</span>
                </div>
              </label>
            </div>

            <div className="profile__form-group">
              <label className="profile__label">
                <span className="profile__label-text">Email</span>
                <div className="profile__input-wrapper">
                  <input
                    className="profile__input"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="profile__input-icon">✉️</span>
                </div>
              </label>
            </div>

            <div className="profile__form-group">
              <label className="profile__label">
                <span className="profile__label-text">Password</span>
                <div className="profile__input-wrapper">
                  <input
                    className="profile__input"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="profile__input-icon">🔒</span>
                </div>
              </label>
            </div>

            <div className="profile__form-group">
              <label className="profile__label">
                <span className="profile__label-text">Confirm Password</span>
                <div className="profile__input-wrapper">
                  <input
                    className="profile__input"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span className="profile__input-icon">🔒</span>
                </div>
              </label>
            </div>

            <button
              className={`profile__button ${
                loading ? "profile__button--loading" : ""
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="profile__button-content">
                  <span className="profile__spinner"></span>
                  Updating...
                </span>
              ) : (
                <span className="profile__button-content">
                  <span className="profile__button-icon">💾</span>
                  Update Profile
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
