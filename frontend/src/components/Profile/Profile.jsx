// Updated Profile.jsx without password fields but with proper styling
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { toast } from "react-toastify";
import { updateProfile } from "../../store/features/users/userSlice.js";
import { reportAPI } from "../../services/api/urlService.js";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("stats");
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, userInfo } = useAppSelector((state) => state.user);

  const fetchWeeklyReports = async () => {
    try {
      setReportsLoading(true);
      const { data } = await reportAPI.getMyReports();
      setReports(data);
    } catch (err) {
      console.error("Error loading archived weekly reports:", err);
      toast.error("Failed to load archived weekly reports.");
    } finally {
      setReportsLoading(false);
    }
  };

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

  const getAchievementsList = (unlockedAchievements = []) => {
    const achievements = [
      {
        id: "first-step",
        title: "First Step",
        description: "Complete your first task or focus session",
        icon: "🌱",
      },
      {
        id: "task-master",
        title: "Task Master",
        description: "Complete 10 tasks in total",
        icon: "⚡",
      },
      {
        id: "goal-getter",
        title: "Goal Getter",
        description: "Achieve your first goal",
        icon: "🏆",
      },
      {
        id: "focus-fanatic",
        title: "Focus Fanatic",
        description: "Complete 5 focus sessions",
        icon: "🧠",
      },
      {
        id: "streak-starter",
        title: "Streak Starter",
        description: "Maintain a 3-day activity streak",
        icon: "🔥",
      },
      {
        id: "streak-legend",
        title: "Streak Legend",
        description: "Maintain a 10-day activity streak",
        icon: "👑",
      },
    ];

    return achievements.map(ach => ({
      ...ach,
      unlocked: unlockedAchievements.includes(ach.id),
    }));
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="profile">
      <div className="profile__container">
        {/* Left Column: Profile Settings */}
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

        {/* Right Column: Gamification Stats & Weekly Report Archives */}
        <div className="profile__gamification">
          
          {/* Tab Navigation header */}
          <div className="profile-tabs-nav">
            <button
              className={`profile-tab-btn ${activeTab === "stats" ? "active" : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              🏅 Progression & Medals
            </button>
            <button
              className={`profile-tab-btn ${activeTab === "archive" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("archive");
                fetchWeeklyReports();
              }}
            >
              📂 Weekly Reports Vault
            </button>
          </div>

          {activeTab === "stats" ? (
            <div className="profile-tab-content animate-fade">
              <div className="gamification-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2>Activity & Progression</h2>
                  <p>Track your productivity milestones and badges</p>
                </div>
                <button
                  type="button"
                  className="profile-yir-btn"
                  onClick={() => navigate("/year-in-review")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                  }}
                >
                  🏆 Year in Review →
                </button>
              </div>

              {/* XP & Level Panel */}
              <div className="gamification-card level-card">
                <div className="level-card__header">
                  <span className="level-card__badge">Level {userInfo?.level || 1}</span>
                  <span className="level-card__xp">{userInfo?.xp || 0} Total XP</span>
                </div>
                <div className="level-card__bar">
                  <div 
                    className="level-card__fill" 
                    style={{ width: `${(userInfo?.xp || 0) % 100}%` }}
                  ></div>
                </div>
                <span className="level-card__sub">{(userInfo?.xp || 0) % 100}/100 XP to Level {(userInfo?.level || 1) + 1}</span>
              </div>

              {/* Stats Grid */}
              <div className="gamification-stats-grid">
                <div className="stat-box streak">
                  <span className="stat-box__icon">🔥</span>
                  <span className="stat-box__value">{userInfo?.streak || 0} Days</span>
                  <span className="stat-box__label">Current Streak</span>
                </div>
                <div className="stat-box tasks">
                  <span className="stat-box__icon">✅</span>
                  <span className="stat-box__value">{userInfo?.totalTasksCompleted || 0}</span>
                  <span className="stat-box__label">Tasks Done</span>
                </div>
                <div className="stat-box goals">
                  <span className="stat-box__icon">🏆</span>
                  <span className="stat-box__value">{userInfo?.totalGoalsCompleted || 0}</span>
                  <span className="stat-box__label">Goals Achieved</span>
                </div>
                <div className="stat-box pomodoro">
                  <span className="stat-box__icon">⏱️</span>
                  <span className="stat-box__value">{userInfo?.totalPomodorosCompleted || 0}</span>
                  <span className="stat-box__label">Focus Sessions</span>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="achievements-section">
                <h3>Achievements Badges</h3>
                <div className="achievements-grid">
                  {getAchievementsList(userInfo?.achievements || []).map(ach => (
                    <div key={ach.id} className={`achievement-medal ${ach.unlocked ? 'unlocked' : 'locked'}`} title={ach.description}>
                      <div className="medal-icon">{ach.icon}</div>
                      <div className="medal-info">
                        <span className="medal-title">{ach.title}</span>
                        <span className="medal-desc">{ach.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-tab-content animate-fade">
              <div className="gamification-header">
                <h2>Weekly Report Vault</h2>
                <p>Access your past weekly performance reports and digests</p>
              </div>

              {reportsLoading ? (
                <div className="vault-loading">
                  <LoadingSpinner message="Retrieving archived reports..." />
                </div>
              ) : reports.length === 0 ? (
                <div className="vault-empty">
                  <span className="vault-empty__icon">📁</span>
                  <p>No reports archived in the vault yet.</p>
                  <span className="vault-empty__sub">Reports are archived automatically once generated.</span>
                </div>
              ) : (
                <div className="vault-list">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className="vault-row"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="vault-row__info">
                        <span className="vault-row__date">
                          {new Date(report.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(report.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="vault-row__sub">
                          {report.tasksCompleted} Tasks Completed | {report.completedGoals} Goals Completed
                        </span>
                      </div>
                      <div className="vault-row__chevron">→</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Modal Popup */}
      {selectedReport && (
        <div className="report-modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal__header">
              <h3>Weekly Digest Details</h3>
              <button className="report-modal__close" onClick={() => setSelectedReport(null)}>×</button>
            </div>
            <div className="report-modal__subheader">
              {new Date(selectedReport.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} to {new Date(selectedReport.endDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            
            <div className="report-modal__stats">
              <div className="report-stat-card bg-tasks">
                <span className="report-stat-card__val">{selectedReport.tasksCompleted}</span>
                <span className="report-stat-card__lbl">Completed Tasks</span>
              </div>
              <div className="report-stat-card bg-progress">
                <span className="report-stat-card__val">{selectedReport.avgProgress}%</span>
                <span className="report-stat-card__lbl">Average Progress</span>
              </div>
              <div className="report-stat-card bg-focus">
                <span className="report-stat-card__val">{selectedReport.focusHours}h</span>
                <span className="report-stat-card__lbl">Focus/Day Avg</span>
              </div>
              <div className="report-stat-card bg-consistency">
                <span className="report-stat-card__val">{selectedReport.consistencyRate}%</span>
                <span className="report-stat-card__lbl">Consistency Rate</span>
              </div>
            </div>

            <div className="report-modal__insights">
              <h4>AI Coach Insights</h4>
              <ul>
                {selectedReport.insights && selectedReport.insights.map((insight, idx) => (
                  <li key={idx}>
                    <span className="insight-bullet">⚡</span>
                    <span className="insight-text">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
