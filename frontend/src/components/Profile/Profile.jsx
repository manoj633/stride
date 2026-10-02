import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { toast } from "react-toastify";
import { updateProfile, clearUserInfo } from "../../store/features/users/userSlice.js";
import { reportAPI, userAPI } from "../../services/api/urlService.js";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../Common/LoadingSpinner";
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiCheckCircle,
  FiAward,
  FiClock,
  FiZap,
  FiCalendar,
  FiFolder,
  FiExternalLink,
  FiChevronRight,
  FiX,
  FiDownload,
  FiTrash2,
  FiAlertTriangle,
  FiDatabase,
} from "react-icons/fi";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("stats");
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // GDPR Data Portability & Account Erasure state
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, userInfo } = useAppSelector((state) => state.user);

  const fetchWeeklyReports = async () => {
    try {
      setReportsLoading(true);
      const { data } = await reportAPI.getMyReports();
      const list = data || [];
      const seen = new Set();
      const deduplicated = list.filter((r) => {
        const startStr = new Date(r.startDate).toLocaleDateString();
        const endStr = new Date(r.endDate).toLocaleDateString();
        const key = `${startStr}_${endStr}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setReports(deduplicated);
    } catch (err) {
      console.error("Error loading archived weekly reports:", err);
      toast.error("Failed to load archived weekly reports.");
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || "");
      setEmail(userInfo.email || "");
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await dispatch(
        updateProfile({
          _id: userInfo._id,
          name: name.trim(),
          email: email.trim(),
        })
      ).unwrap();
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to update profile");
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const response = await userAPI.exportData();
      const blob = new Blob([response.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      let filename = `stride-personal-data-${new Date().toISOString().slice(0, 10)}.json`;
      const disposition = response.headers?.["content-disposition"];
      if (disposition && disposition.indexOf("filename=") !== -1) {
        const matches = /filename="?([^"]+)"?/.exec(disposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Personal data archive downloaded successfully!");
    } catch (err) {
      console.error("Export data error:", err);
      let errorMsg = "Failed to export personal data.";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.message) errorMsg = parsed.message;
        } catch (_) {}
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      toast.error(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword.trim()) {
      toast.error("Please enter your password to confirm account deletion.");
      return;
    }
    try {
      setIsDeleting(true);
      const res = await userAPI.deleteAccount({ password: deletePassword });
      toast.success(res.data?.message || "Account permanently deleted.");
      setShowDeleteModal(false);
      setDeletePassword("");
      dispatch(clearUserInfo());
      navigate("/register");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete account. Please verify your password.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitial = () => {
    return name ? name.charAt(0).toUpperCase() : userInfo?.name?.charAt(0)?.toUpperCase() || "U";
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

    return achievements.map((ach) => ({
      ...ach,
      unlocked: unlockedAchievements.includes(ach.id),
    }));
  };

  if (loading && !userInfo) return <LoadingSpinner message="Loading profile..." />;

  const level = userInfo?.level || 1;
  const xp = userInfo?.xp || 0;
  const xpInCurrentLevel = xp % 100;
  const unlockedCount = (userInfo?.achievements || []).length;

  return (
    <div className="profile-page">
      {/* Top Header Shell */}
      <header className="profile-topbar">
        <div className="profile-topbar__left">
          <div className="profile-topbar__icon">
            <FiUser size={20} />
          </div>
          <div className="profile-topbar__headings">
            <h1 className="profile-topbar__title">Account & Profile</h1>
            <p className="profile-topbar__subtitle">
              Manage personal credentials, security protection, and productivity achievements
            </p>
          </div>
        </div>

        <div className="profile-topbar__right">
          {userInfo?.isAdmin && (
            <span className="profile-pill profile-pill--admin">
              👑 Administrator
            </span>
          )}
          <span className="profile-pill profile-pill--verified">
            <FiCheckCircle size={13} /> Email Verified
          </span>
          {userInfo?.isTwoFactorEnabled ? (
            <span className="profile-pill profile-pill--2fa">
              <FiShield size={13} /> 2FA Active
            </span>
          ) : (
            <span className="profile-pill profile-pill--2fa-off">
              <FiShield size={13} /> 2FA Inactive
            </span>
          )}
        </div>
      </header>

      {/* Main Two-Column Content Grid */}
      <div className="profile-layout">
        {/* Left Column: Personal Identity & Security */}
        <div className="profile-col profile-col--left">
          {/* Card 1: Identity & Edit Form */}
          <div className="profile-card">
            <div className="profile-user-summary">
              <div
                className="profile-user-avatar"
                aria-label={`User avatar initial ${getInitial()}`}
              >
                {getInitial()}
              </div>
              <div className="profile-user-meta">
                <h2 className="profile-user-name">{userInfo?.name || "User"}</h2>
                <span className="profile-user-email">{userInfo?.email}</span>
                <div className="profile-user-chips">
                  <span className="profile-stat-chip">Level {level}</span>
                  <span className="profile-stat-chip">{xp} Total XP</span>
                  <span className="profile-stat-chip">{userInfo?.streak || 0}d Streak</span>
                </div>
              </div>
            </div>

            <form className="profile-form" onSubmit={submitHandler}>
              <div className="profile-form-group">
                <label className="profile-form-label" htmlFor="profile-name">
                  Full Name
                </label>
                <div className="profile-input-box">
                  <FiUser className="profile-input-icon" />
                  <input
                    id="profile-name"
                    type="text"
                    className="profile-input"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <div className="profile-form-label-row">
                  <label className="profile-form-label" htmlFor="profile-email">
                    Email Address
                  </label>
                  <span className="profile-email-badge">
                    <FiCheckCircle size={12} /> Confirmed
                  </span>
                </div>
                <div className="profile-input-box">
                  <FiMail className="profile-input-icon" />
                  <input
                    id="profile-email"
                    type="email"
                    className="profile-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="profile-submit-btn"
                disabled={loading}
              >
                {loading ? "Saving Changes..." : "Save Profile Changes"}
              </button>
            </form>
          </div>

          {/* Card 2: Security & Authentication */}
          <div className="profile-card profile-card--security">
            <div className="profile-card-header">
              <div className="profile-card-header__icon">
                <FiShield size={18} />
              </div>
              <div>
                <h3 className="profile-card-title">Security & Credentials</h3>
                <p className="profile-card-subtitle">
                  Password management and multi-factor defense
                </p>
              </div>
            </div>

            <div className="security-rows">
              {/* Password Row */}
              <div className="security-row">
                <div className="security-row__left">
                  <div className="security-icon-circle">
                    <FiLock size={16} />
                  </div>
                  <div className="security-row__meta">
                    <span className="security-row__title">Account Password</span>
                    <span className="security-row__desc">
                      Protected with encrypted hash credentials
                    </span>
                  </div>
                </div>
                <a
                  href="/forgot-password"
                  className="security-btn security-btn--outline"
                >
                  Reset Password
                </a>
              </div>

              {/* 2FA Row */}
              <div className="security-row">
                <div className="security-row__left">
                  <div className="security-icon-circle security-icon-circle--accent">
                    <FiShield size={16} />
                  </div>
                  <div className="security-row__meta">
                    <div className="security-row__title-wrap">
                      <span className="security-row__title">
                        Two-Factor Authentication (2FA)
                      </span>
                      {userInfo?.isTwoFactorEnabled && (
                        <span className="security-badge-active">Enabled</span>
                      )}
                    </div>
                    <span className="security-row__desc">
                      {userInfo?.isTwoFactorEnabled
                        ? "Account secured with TOTP Authenticator & backup codes"
                        : "Required for enterprise account access"}
                    </span>
                  </div>
                </div>
                {userInfo?.isTwoFactorEnabled ? (
                  <button
                    type="button"
                    onClick={() => navigate("/two-factor-setup")}
                    className="security-btn security-btn--subtle"
                  >
                    View Setup
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/two-factor-setup")}
                    className="security-btn security-btn--primary"
                  >
                    Configure 2FA
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Privacy & Data Governance (GDPR Art. 17 & 20) */}
          <div className="profile-card profile-card--privacy">
            <div className="profile-card-header">
              <div className="profile-card-header__icon profile-card-header__icon--privacy">
                <FiDatabase size={18} />
              </div>
              <div>
                <h3 className="profile-card-title">Privacy & Data Governance</h3>
                <p className="profile-card-subtitle">
                  GDPR Article 17 (Right to Erasure) & Article 20 (Data Portability)
                </p>
              </div>
            </div>

            <div className="security-rows">
              {/* Data Portability (Export) */}
              <div className="security-row">
                <div className="security-row__left">
                  <div className="security-icon-circle security-icon-circle--accent">
                    <FiDownload size={16} />
                  </div>
                  <div className="security-row__meta">
                    <span className="security-row__title">Export Personal Data</span>
                    <span className="security-row__desc">
                      Download your profile, goals, tasks, reports, and activity in JSON format
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="security-btn security-btn--subtle"
                  id="export-data-btn"
                >
                  {isExporting ? "Exporting..." : "Export Data"}
                </button>
              </div>

              {/* Danger Zone: Right to Erasure (Account Deletion) */}
              <div className="security-row security-row--danger">
                <div className="security-row__left">
                  <div className="security-icon-circle security-icon-circle--danger">
                    <FiTrash2 size={16} />
                  </div>
                  <div className="security-row__meta">
                    <span className="security-row__title security-row__title--danger">
                      Delete Account
                    </span>
                    <span className="security-row__desc">
                      Permanently wipe your account and all associated workspace data (irreversible)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeletePassword("");
                    setShowDeleteModal(true);
                  }}
                  className="security-btn security-btn--danger"
                  id="delete-account-btn"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Gamification, Progression & Weekly Vault */}
        <div className="profile-col profile-col--right">
          <div className="profile-card profile-card--tabs">
            {/* Tab Navigation header */}
            <div className="profile-tabs-header">
              <button
                type="button"
                className={`profile-tab-button ${
                  activeTab === "stats" ? "active" : ""
                }`}
                onClick={() => setActiveTab("stats")}
              >
                <FiAward size={16} />
                <span>Progression & Badges</span>
              </button>
              <button
                type="button"
                className={`profile-tab-button ${
                  activeTab === "archive" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab("archive");
                  fetchWeeklyReports();
                }}
              >
                <FiFolder size={16} />
                <span>Weekly Report Vault</span>
              </button>
            </div>

            {activeTab === "stats" ? (
              <div className="profile-tab-body">
                {/* Level & XP Hero Bar */}
                <div className="level-hero">
                  <div className="level-hero__info">
                    <div className="level-hero__badge">
                      <span className="level-hero__lvl">Level {level}</span>
                      <span className="level-hero__xp">{xp} Total XP</span>
                    </div>
                    <button
                      type="button"
                      className="level-hero__yir-btn"
                      onClick={() => navigate("/year-in-review")}
                    >
                      <FiAward size={14} /> Year in Review →
                    </button>
                  </div>

                  <div className="level-progress-bar">
                    <div
                      className="level-progress-fill"
                      style={{ width: `${Math.max(xpInCurrentLevel, 4)}%` }}
                    />
                  </div>

                  <div className="level-hero__footer">
                    <span>{xpInCurrentLevel} / 100 XP to Level {level + 1}</span>
                    <span>{100 - xpInCurrentLevel} XP remaining</span>
                  </div>
                </div>

                {/* 2x2 Metric Grid */}
                <div className="stats-metric-grid">
                  <div className="metric-tile metric-tile--streak">
                    <div className="metric-tile__icon-wrap">🔥</div>
                    <div className="metric-tile__content">
                      <span className="metric-tile__val">
                        {userInfo?.streak || 0} <span className="metric-tile__unit">Days</span>
                      </span>
                      <span className="metric-tile__label">Current Streak</span>
                    </div>
                  </div>

                  <div className="metric-tile metric-tile--tasks">
                    <div className="metric-tile__icon-wrap">✅</div>
                    <div className="metric-tile__content">
                      <span className="metric-tile__val">
                        {userInfo?.totalTasksCompleted || 0}
                      </span>
                      <span className="metric-tile__label">Tasks Done</span>
                    </div>
                  </div>

                  <div className="metric-tile metric-tile--goals">
                    <div className="metric-tile__icon-wrap">🏆</div>
                    <div className="metric-tile__content">
                      <span className="metric-tile__val">
                        {userInfo?.totalGoalsCompleted || 0}
                      </span>
                      <span className="metric-tile__label">Goals Achieved</span>
                    </div>
                  </div>

                  <div className="metric-tile metric-tile--focus">
                    <div className="metric-tile__icon-wrap">⏱️</div>
                    <div className="metric-tile__content">
                      <span className="metric-tile__val">
                        {userInfo?.totalPomodorosCompleted || 0}
                      </span>
                      <span className="metric-tile__label">Focus Sessions</span>
                    </div>
                  </div>
                </div>

                {/* Achievements Badges */}
                <div className="badges-section">
                  <div className="badges-header">
                    <h4 className="badges-title">Achievements & Milestones</h4>
                    <span className="badges-count">
                      {unlockedCount} / {getAchievementsList().length} Unlocked
                    </span>
                  </div>

                  <div className="badges-grid">
                    {getAchievementsList(userInfo?.achievements || []).map((ach) => (
                      <div
                        key={ach.id}
                        className={`badge-card ${
                          ach.unlocked ? "badge-card--unlocked" : "badge-card--locked"
                        }`}
                        title={ach.description}
                      >
                        <div className="badge-card__icon">{ach.icon}</div>
                        <div className="badge-card__meta">
                          <span className="badge-card__title">{ach.title}</span>
                          <span className="badge-card__desc">{ach.description}</span>
                        </div>
                        {ach.unlocked && (
                          <span className="badge-card__status">Unlocked</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-tab-body">
                <div className="vault-header">
                  <div>
                    <h3 className="vault-title">Weekly Report Vault</h3>
                    <p className="vault-subtitle">
                      Review archived performance digests and productivity rollups
                    </p>
                  </div>
                </div>

                {reportsLoading ? (
                  <div className="vault-loading">
                    <LoadingSpinner message="Retrieving archived reports..." />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="vault-empty">
                    <div className="vault-empty__icon">📁</div>
                    <h4 className="vault-empty__title">No Reports in Vault</h4>
                    <p className="vault-empty__text">
                      Weekly executive digests are generated every Monday morning.
                    </p>
                  </div>
                ) : (
                  <div className="vault-list">
                    {reports.map((report) => (
                      <div
                        key={report._id}
                        className="vault-row"
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="vault-row__icon-box">
                          <FiFolder size={18} />
                        </div>
                        <div className="vault-row__info">
                          <span className="vault-row__date">
                            {new Date(report.startDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            –{" "}
                            {new Date(report.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="vault-row__sub">
                            {report.tasksCompleted} Tasks Completed • {report.completedGoals} Goals Reached
                          </span>
                        </div>
                        <div className="vault-row__arrow">
                          <FiChevronRight size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div
          className="report-modal-backdrop"
          onClick={() => setSelectedReport(null)}
        >
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal__header">
              <h3>Weekly Digest Details</h3>
              <button
                className="report-modal__close"
                onClick={() => setSelectedReport(null)}
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="report-modal__subheader">
              {new Date(selectedReport.startDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              to{" "}
              {new Date(selectedReport.endDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>

            <div className="report-modal__stats">
              <div className="report-stat-card bg-tasks">
                <span className="report-stat-card__val">
                  {selectedReport.tasksCompleted}
                </span>
                <span className="report-stat-card__lbl">Completed Tasks</span>
              </div>
              <div className="report-stat-card bg-progress">
                <span className="report-stat-card__val">
                  {selectedReport.avgProgress}%
                </span>
                <span className="report-stat-card__lbl">Average Progress</span>
              </div>
              <div className="report-stat-card bg-focus">
                <span className="report-stat-card__val">
                  {selectedReport.focusHours}h
                </span>
                <span className="report-stat-card__lbl">Focus/Day Avg</span>
              </div>
              <div className="report-stat-card bg-consistency">
                <span className="report-stat-card__val">
                  {selectedReport.consistencyRate}%
                </span>
                <span className="report-stat-card__lbl">Consistency Rate</span>
              </div>
            </div>

            <div className="report-modal__insights">
              <h4>AI Coach Insights</h4>
              <ul>
                {selectedReport.insights &&
                  selectedReport.insights.map((insight, idx) => (
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

      {/* Account Deletion Confirmation Modal (GDPR Article 17) */}
      {showDeleteModal && (
        <div
          className="report-modal-backdrop"
          onClick={() => {
            if (!isDeleting) {
              setShowDeleteModal(false);
              setDeletePassword("");
            }
          }}
        >
          <div
            className="report-modal privacy-delete-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="report-modal__header">
              <div className="privacy-delete-modal__title-row">
                <div className="privacy-delete-modal__icon">
                  <FiAlertTriangle size={20} />
                </div>
                <div>
                  <h3 id="delete-modal-title" className="report-modal__title text-danger">
                    Permanently Delete Account
                  </h3>
                  <p className="privacy-delete-modal__subtitle">
                    GDPR Article 17 Right to Erasure
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="report-modal__close-btn"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="privacy-delete-modal__body">
              <div className="privacy-delete-callout">
                <FiAlertTriangle className="privacy-delete-callout__icon" size={24} />
                <div className="privacy-delete-callout__text">
                  <strong>Warning: This action is permanent and immediate.</strong>
                  <p>
                    All your goals, tasks, subtasks, comments, weekly progress reports,
                    focus sessions, and login credentials will be permanently erased.
                    You will not be able to recover this account or any associated data.
                  </p>
                </div>
              </div>

              <form onSubmit={handleDeleteAccount} className="privacy-delete-form">
                <div className="profile-form-group">
                  <label className="profile-form-label" htmlFor="delete-account-password">
                    Confirm your current password
                  </label>
                  <div className="profile-input-box">
                    <FiLock className="profile-input-icon" />
                    <input
                      id="delete-account-password"
                      type="password"
                      className="profile-input"
                      placeholder="Enter your current password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      required
                      autoFocus
                      disabled={isDeleting}
                    />
                  </div>
                </div>

                <div className="privacy-delete-modal__actions">
                  <button
                    type="button"
                    className="security-btn security-btn--outline"
                    disabled={isDeleting}
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletePassword("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="security-btn security-btn--danger-solid"
                    disabled={isDeleting || !deletePassword.trim()}
                    id="confirm-delete-account-btn"
                  >
                    {isDeleting ? "Erasing Account..." : "Permanently Delete Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
