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
          <h2 className="profile__title">User Profile</h2>
          <form className="profile__form" onSubmit={submitHandler}>
            <div className="profile__form-group">
              <label className="profile__label">Name</label>
              <input
                className="profile__input"
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="profile__form-group">
              <label className="profile__label">Email</label>
              <input
                className="profile__input"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="profile__form-group">
              <label className="profile__label">Password</label>
              <input
                className="profile__input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="profile__form-group">
              <label className="profile__label">Confirm Password</label>
              <input
                className="profile__input"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              className={`profile__button ${
                loading ? "profile__button--loading" : ""
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
