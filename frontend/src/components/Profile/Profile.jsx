// Updated Profile.jsx without password fields but with proper styling
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { toast } from "react-toastify";
import { updateProfile } from "../../store/features/users/userSlice.js";
import "./Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, userInfo } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(
        updateProfile({
          _id: userInfo._id,
          name,
          email,
        })
      ).unwrap();
      toast.success("Profile updated successfully");
      navigate(-1);
    } catch (err) {
      toast.error(err?.data?.message || err?.error);
    }
  };

  // Get first letter of name for avatar
  const getInitial = () => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="profile">
      <div className="profile__container">
        <div className="profile__sidebar">
          <div className="profile__header">
            <div
              className="profile__avatar"
              aria-label={`User avatar, initial ${getInitial()}`}
            >
              {getInitial()}
            </div>
            <div className="profile__header-info">
              <h2 className="profile__title">Profile Settings</h2>
              <p className="profile__subtitle">
                Manage your account information
              </p>
            </div>
          </div>

          {userInfo?.isAdmin && (
            <div className="profile__admin-badge">Administrator</div>
          )}

          <form className="profile__form" onSubmit={submitHandler}>
            <div className="profile__form-group">
              <label className="profile__label">Name</label>
              <div className="profile__input-wrapper">
                <input
                  className="profile__input"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  aria-label="Profile name"
                />
              </div>
            </div>

            <div className="profile__form-group">
              <label className="profile__label">Email Address</label>
              <div className="profile__input-wrapper">
                <input
                  className="profile__input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Profile email address"
                />
              </div>
            </div>

            <div className="profile__form-group">
              <p className="profile__label">Password Management</p>
              <a
                href="/forgot-password"
                className="profile__button"
                style={{ textDecoration: "none", textAlign: "center" }}
              >
                Reset Password
              </a>
            </div>

            <button
              type="submit"
              className={`profile__button ${
                loading ? "profile__button--loading" : ""
              }`}
              disabled={loading}
              aria-label="Update profile"
            >
              <div className="profile__button-content">
                {loading ? (
                  <>
                    <span className="profile__spinner"></span>
                    <span>Updating...</span>
                  </>
                ) : (
                  "Update Profile"
                )}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
