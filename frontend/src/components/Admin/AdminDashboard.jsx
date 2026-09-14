import React, { useState, useEffect, useCallback } from "react";
import {
  FiShield,
  FiUsers,
  FiTarget,
  FiCheckSquare,
  FiTrendingUp,
  FiSearch,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiAward,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGoals: 0,
    totalTasks: 0,
    signupsThisWeek: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch system statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/users/admin/stats", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load admin metrics");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load system statistics");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch user list
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const query = new URLSearchParams({
        page: String(page),
        limit: "10",
        search: debouncedSearch,
      });
      const res = await fetch(`/api/users?${query.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load user directory");
      const data = await res.json();
      setUsers(data.users || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      setTotalUsers(data.totalUsers || 0);
    } catch (err) {
      console.error(err);
      toast.error("Could not load users list");
    } finally {
      setLoadingUsers(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch single user detail
  const handleOpenDetail = async (userId) => {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user details");
      const data = await res.json();
      setUserDetail(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch user details");
      setSelectedUserId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedUserId(null);
    setUserDetail(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Unknown";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Never";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Unknown";
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="admin-container">
      {/* Top Header */}
      <header className="admin-header">
        <div className="admin-header__left">
          <div className="admin-header__badge">
            <FiShield className="admin-header__badge-icon" />
            <span>Administrator Portal</span>
          </div>
          <h1 className="admin-header__title">System Overview & Management</h1>
          <p className="admin-header__subtitle">
            Platform health, aggregate metrics, and searchable user directory.
          </p>
        </div>
        <div className="admin-header__actions">
          <button
            className="admin-btn admin-btn--secondary"
            onClick={() => {
              fetchStats();
              fetchUsers();
            }}
            title="Refresh statistics and user list"
            disabled={loadingStats || loadingUsers}
          >
            <FiRefreshCw
              className={loadingStats || loadingUsers ? "admin-spin" : ""}
            />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card admin-stat-card--users">
          <div className="admin-stat-card__icon-wrapper">
            <FiUsers />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Total Users</span>
            <span className="admin-stat-card__value">
              {loadingStats ? "..." : stats.totalUsers.toLocaleString()}
            </span>
            <span className="admin-stat-card__hint">Registered accounts</span>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-card--goals">
          <div className="admin-stat-card__icon-wrapper">
            <FiTarget />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Total Goals</span>
            <span className="admin-stat-card__value">
              {loadingStats ? "..." : stats.totalGoals.toLocaleString()}
            </span>
            <span className="admin-stat-card__hint">Across all users</span>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-card--tasks">
          <div className="admin-stat-card__icon-wrapper">
            <FiCheckSquare />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Total Tasks</span>
            <span className="admin-stat-card__value">
              {loadingStats ? "..." : stats.totalTasks.toLocaleString()}
            </span>
            <span className="admin-stat-card__hint">Platform tasks tracked</span>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-card--signups">
          <div className="admin-stat-card__icon-wrapper">
            <FiTrendingUp />
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Signups This Week</span>
            <span className="admin-stat-card__value">
              {loadingStats ? "..." : stats.signupsThisWeek.toLocaleString()}
            </span>
            <span className="admin-stat-card__hint">Last 7 calendar days</span>
          </div>
        </div>
      </section>

      {/* User Directory Section */}
      <section className="admin-section">
        <div className="admin-section__header">
          <div className="admin-section__title-group">
            <h2 className="admin-section__title">User Directory</h2>
            <span className="admin-section__count">
              {totalUsers} {totalUsers === 1 ? "user" : "users"} found
            </span>
          </div>
          <div className="admin-search-box">
            <FiSearch className="admin-search-box__icon" />
            <input
              type="text"
              className="admin-search-box__input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="admin-search-box__clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="admin-table-container">
          {loadingUsers ? (
            <div className="admin-loading-state">
              <FiRefreshCw className="admin-spin admin-loading-icon" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="admin-empty-state">
              <FiUsers className="admin-empty-icon" />
              <h3>No users found</h3>
              <p>
                {debouncedSearch
                  ? `No accounts matched "${debouncedSearch}". Try a different search term.`
                  : "There are currently no registered users on the platform."}
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>2FA Status</th>
                  <th>Level & XP</th>
                  <th>Tasks Completed</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="admin-table__row">
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar">
                          {getInitials(u.name)}
                        </div>
                        <div className="admin-user-info">
                          <span className="admin-user-name">{u.name}</span>
                          <span className="admin-user-email">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.isAdmin ? (
                        <span className="admin-pill admin-pill--admin">
                          <FiShield /> Admin
                        </span>
                      ) : (
                        <span className="admin-pill admin-pill--user">
                          Member
                        </span>
                      )}
                    </td>
                    <td>
                      {u.hasTwoFactorSecret ? (
                        <span className="admin-pill admin-pill--2fa-active" title="2FA is configured and active">
                          <FiCheckCircle /> Configured
                        </span>
                      ) : (
                        <span className="admin-pill admin-pill--2fa-none" title="2FA has not been configured yet">
                          <FiAlertCircle /> Off
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="admin-gamification-cell">
                        <span className="admin-level-badge">Lvl {u.level || 1}</span>
                        <span className="admin-xp-text">{u.xp || 0} XP</span>
                        {u.streak > 0 && (
                          <span className="admin-streak-badge" title={`${u.streak} day streak`}>
                            🔥 {u.streak}d
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="admin-task-count">
                        {u.totalTasksCompleted || 0}
                      </span>
                    </td>
                    <td>
                      <span className="admin-date-text">
                        {formatDate(u.createdAt)}
                      </span>
                    </td>
                    <td>
                      <span className="admin-date-text" title={formatDateTime(u.lastActive)}>
                        {formatDate(u.lastActive)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn--sm admin-btn--primary"
                        onClick={() => handleOpenDetail(u._id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {!loadingUsers && pages > 1 && (
          <div className="admin-pagination">
            <span className="admin-pagination__info">
              Showing page <strong>{page}</strong> of <strong>{pages}</strong> (
              {totalUsers} total)
            </span>
            <div className="admin-pagination__buttons">
              <button
                className="admin-btn admin-btn--secondary admin-btn--sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
              >
                <FiChevronLeft /> Previous
              </button>
              <button
                className="admin-btn admin-btn--secondary admin-btn--sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                disabled={page >= pages}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* User Detail Modal */}
      {selectedUserId && (
        <div className="admin-modal-overlay" onClick={handleCloseDetail}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="admin-modal__close"
              onClick={handleCloseDetail}
              aria-label="Close dialog"
            >
              <FiX />
            </button>

            {loadingDetail || !userDetail ? (
              <div className="admin-modal__loading">
                <FiRefreshCw className="admin-spin admin-loading-icon" />
                <p>Loading user profile...</p>
              </div>
            ) : (
              <div className="admin-modal__content">
                {/* Profile Header */}
                <div className="admin-modal__header">
                  <div className="admin-modal__avatar">
                    {getInitials(userDetail.name)}
                  </div>
                  <div className="admin-modal__header-details">
                    <div className="admin-modal__name-row">
                      <h3 className="admin-modal__name">{userDetail.name}</h3>
                      {userDetail.isAdmin && (
                        <span className="admin-pill admin-pill--admin">
                          <FiShield /> Administrator
                        </span>
                      )}
                    </div>
                    <span className="admin-modal__email">
                      {userDetail.email}
                    </span>
                    <div className="admin-modal__tags">
                      <span className="admin-modal__meta-tag">
                        <FiCalendar /> Joined {formatDate(userDetail.createdAt)}
                      </span>
                      <span className="admin-modal__meta-tag">
                        <FiActivity /> Last login: {formatDate(userDetail.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid: Resource Activity */}
                <h4 className="admin-modal__section-heading">Platform Engagement</h4>
                <div className="admin-modal__stats-grid">
                  <div className="admin-modal__stat-card">
                    <span className="admin-modal__stat-val">
                      {userDetail.goalsCount || 0}
                    </span>
                    <span className="admin-modal__stat-key">Goals Created</span>
                  </div>
                  <div className="admin-modal__stat-card">
                    <span className="admin-modal__stat-val">
                      {userDetail.tasksCount || 0}
                    </span>
                    <span className="admin-modal__stat-key">Tasks Created</span>
                  </div>
                  <div className="admin-modal__stat-card">
                    <span className="admin-modal__stat-val">
                      {userDetail.subtasksCount || 0}
                    </span>
                    <span className="admin-modal__stat-key">Subtasks</span>
                  </div>
                  <div className="admin-modal__stat-card">
                    <span className="admin-modal__stat-val">
                      {userDetail.totalTasksCompleted || 0}
                    </span>
                    <span className="admin-modal__stat-key">Tasks Completed</span>
                  </div>
                </div>

                {/* Gamification & Productivity */}
                <h4 className="admin-modal__section-heading">Productivity & Progress</h4>
                <div className="admin-modal__gamification-grid">
                  <div className="admin-modal__game-item">
                    <span className="admin-modal__game-label">Level</span>
                    <span className="admin-modal__game-value">
                      Level {userDetail.level || 1}
                    </span>
                  </div>
                  <div className="admin-modal__game-item">
                    <span className="admin-modal__game-label">Experience</span>
                    <span className="admin-modal__game-value">
                      {userDetail.xp || 0} XP
                    </span>
                  </div>
                  <div className="admin-modal__game-item">
                    <span className="admin-modal__game-label">Daily Streak</span>
                    <span className="admin-modal__game-value">
                      🔥 {userDetail.streak || 0} Days
                    </span>
                  </div>
                  <div className="admin-modal__game-item">
                    <span className="admin-modal__game-label">Pomodoro Sessions</span>
                    <span className="admin-modal__game-value">
                      <FiClock /> {userDetail.totalPomodorosCompleted || 0}
                    </span>
                  </div>
                </div>

                {/* Security Stance */}
                <h4 className="admin-modal__section-heading">Security & Authentication</h4>
                <div className="admin-modal__security-row">
                  <div className="admin-modal__security-item">
                    <span className="admin-modal__security-key">Two-Factor Authentication:</span>
                    {userDetail.hasTwoFactorSecret ? (
                      <span className="admin-pill admin-pill--2fa-active">
                        <FiCheckCircle /> Configured & Verified
                      </span>
                    ) : (
                      <span className="admin-pill admin-pill--2fa-none">
                        <FiAlertCircle /> Not Configured
                      </span>
                    )}
                  </div>
                  <div className="admin-modal__security-item">
                    <span className="admin-modal__security-key">Enforced Policy:</span>
                    <span className="admin-date-text">
                      {userDetail.isTwoFactorEnabled ? "Active" : "Disabled"}
                    </span>
                  </div>
                </div>

                {/* Achievements List */}
                <h4 className="admin-modal__section-heading">
                  Achievements ({userDetail.achievements?.length || 0})
                </h4>
                {userDetail.achievements && userDetail.achievements.length > 0 ? (
                  <div className="admin-modal__achievements-list">
                    {userDetail.achievements.map((ach, idx) => (
                      <div key={idx} className="admin-modal__achievement-chip">
                        <FiAward className="admin-modal__award-icon" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-modal__empty-text">
                    No gamification achievements earned yet.
                  </p>
                )}

                <div className="admin-modal__footer">
                  <button
                    className="admin-btn admin-btn--secondary"
                    onClick={handleCloseDetail}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
