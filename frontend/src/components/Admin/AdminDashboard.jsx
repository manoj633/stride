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
  FiMessageSquare,
  FiFileText,
  FiTrash2,
  FiSlash,
  FiKey,
  FiAlertTriangle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { userAPI, commentAPI } from "../../services/api/urlService";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users"); // "users" | "comments" | "audit"

  // System Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGoals: 0,
    totalTasks: 0,
    signupsThisWeek: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Directory State
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  // User Detail Modal State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Comments Moderation State
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentPages, setCommentPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [commentSearch, setCommentSearch] = useState("");
  const [debouncedCommentSearch, setDebouncedCommentSearch] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPages, setAuditPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Confirmation Modal State (for destructive or important operations)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmAction: null,
    isDanger: false,
    inputReason: false,
    reason: "",
  });

  // Debounce User Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearch(userSearch);
      setUserPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Debounce Comment Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCommentSearch(commentSearch);
      setCommentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [commentSearch]);

  // 1. Fetch System Stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const { data } = await userAPI.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load system statistics");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch User Directory
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { data } = await userAPI.getAllUsers({
        page: userPage,
        limit: 10,
        search: debouncedUserSearch,
      });
      setUsers(data.users || []);
      setUserPage(data.page || 1);
      setUserPages(data.pages || 1);
      setTotalUsers(data.totalUsers || 0);
    } catch (err) {
      console.error(err);
      toast.error("Could not load users list");
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage, debouncedUserSearch]);

  // 3. Fetch Comments for Moderation
  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const { data } = await commentAPI.adminGetAll({
        page: commentPage,
        limit: 10,
        search: debouncedCommentSearch,
      });
      setComments(data.comments || []);
      setCommentPage(data.page || 1);
      setCommentPages(data.pages || 1);
      setTotalComments(data.totalComments || 0);
    } catch (err) {
      console.error(err);
      toast.error("Could not load comments list");
    } finally {
      setLoadingComments(false);
    }
  }, [commentPage, debouncedCommentSearch]);

  // 4. Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoadingAudit(true);
      const { data } = await userAPI.getAuditLogs({
        page: auditPage,
        limit: 15,
      });
      setAuditLogs(data.logs || []);
      setAuditPage(data.page || 1);
      setAuditPages(data.pages || 1);
      setTotalLogs(data.totalLogs || 0);
    } catch (err) {
      console.error(err);
      toast.error("Could not load audit logs");
    } finally {
      setLoadingAudit(false);
    }
  }, [auditPage]);

  // Initial Load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else if (activeTab === "comments") fetchComments();
    else if (activeTab === "audit") fetchAuditLogs();
  }, [activeTab, fetchUsers, fetchComments, fetchAuditLogs]);

  // Single User Detail
  const handleOpenDetail = async (userId) => {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    try {
      const { data } = await userAPI.getUserById(userId);
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

  // Administrative Moderation Actions
  const handleToggleAdmin = (targetUser) => {
    const newAdminState = !targetUser.isAdmin;
    setConfirmModal({
      isOpen: true,
      title: newAdminState ? "Promote to Admin" : "Demote Admin",
      message: `Are you sure you want to ${
        newAdminState ? "grant administrator rights to" : "remove admin rights from"
      } ${targetUser.name} (${targetUser.email})?`,
      isDanger: !newAdminState,
      inputReason: false,
      reason: "",
      confirmAction: async () => {
        try {
          await userAPI.updateUser(targetUser._id, { isAdmin: newAdminState });
          toast.success(`User ${newAdminState ? "promoted" : "demoted"} successfully`);
          fetchUsers();
          if (userDetail && userDetail._id === targetUser._id) {
            setUserDetail((prev) => ({ ...prev, isAdmin: newAdminState }));
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to update role");
        }
      },
    });
  };

  const handleToggleSuspension = (targetUser) => {
    const newSuspendedState = !targetUser.isSuspended;
    setConfirmModal({
      isOpen: true,
      title: newSuspendedState ? "Suspend Account" : "Reactivate Account",
      message: newSuspendedState
        ? `Are you sure you want to suspend ${targetUser.name}? They will be immediately blocked from logging in.`
        : `Reactivate ${targetUser.name}? They will be able to log in normally again.`,
      isDanger: newSuspendedState,
      inputReason: newSuspendedState,
      reason: "Administrative policy violation",
      confirmAction: async (reasonText) => {
        try {
          await userAPI.updateUser(targetUser._id, {
            isSuspended: newSuspendedState,
            suspensionReason: newSuspendedState ? reasonText : null,
          });
          toast.success(
            `Account ${newSuspendedState ? "suspended" : "reactivated"} successfully`
          );
          fetchUsers();
          if (userDetail && userDetail._id === targetUser._id) {
            setUserDetail((prev) => ({
              ...prev,
              isSuspended: newSuspendedState,
              suspensionReason: newSuspendedState ? reasonText : null,
            }));
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to update account status");
        }
      },
    });
  };

  const handleForceReset2FA = (targetUser) => {
    setConfirmModal({
      isOpen: true,
      title: "Force-Disable 2FA",
      message: `Are you sure you want to force-disable Two-Factor Authentication for ${targetUser.name}? This removes their secret and backup codes, allowing them to sign in with password only if locked out.`,
      isDanger: true,
      inputReason: false,
      reason: "",
      confirmAction: async () => {
        try {
          await userAPI.updateUser(targetUser._id, { forceDisable2FA: true });
          toast.success("2FA has been reset and disabled for user");
          fetchUsers();
          if (userDetail && userDetail._id === targetUser._id) {
            setUserDetail((prev) => ({
              ...prev,
              isTwoFactorEnabled: false,
              hasTwoFactorSecret: false,
            }));
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to reset 2FA");
        }
      },
    });
  };

  const handleDeleteUser = (targetUser) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User & Cascade Data",
      message: `DANGER: Are you sure you want to completely delete ${targetUser.name} (${targetUser.email})? This permanently deletes the user account AND cascades deletion to all their goals, tasks, subtasks, and comments. This action cannot be undone!`,
      isDanger: true,
      inputReason: false,
      reason: "",
      confirmAction: async () => {
        try {
          const { data } = await userAPI.deleteUser(targetUser._id);
          toast.success(
            `User deleted. Cascaded ${data.cascaded?.goals || 0} goals and ${
              data.cascaded?.tasks || 0
            } tasks.`
          );
          handleCloseDetail();
          fetchUsers();
          fetchStats();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to delete user");
        }
      },
    });
  };

  const handleDeleteComment = (comment) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Comment",
      message: `Delete comment: "${comment.text?.substring(0, 60)}..." by ${
        comment.authorId?.name || "Unknown"
      }?`,
      isDanger: true,
      inputReason: false,
      reason: "",
      confirmAction: async () => {
        try {
          await commentAPI.delete(comment._id);
          toast.success("Comment deleted by administrator");
          fetchComments();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to delete comment");
        }
      },
    });
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
            Platform health, account moderation, content control, and audit logs.
          </p>
        </div>
        <div className="admin-header__actions">
          <button
            className="admin-btn admin-btn--secondary"
            onClick={() => {
              fetchStats();
              if (activeTab === "users") fetchUsers();
              else if (activeTab === "comments") fetchComments();
              else if (activeTab === "audit") fetchAuditLogs();
            }}
            title="Refresh current data"
            disabled={loadingStats || loadingUsers || loadingComments || loadingAudit}
          >
            <FiRefreshCw
              className={
                loadingStats || loadingUsers || loadingComments || loadingAudit
                  ? "admin-spin"
                  : ""
              }
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

      {/* Tab Controls */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "users" ? "admin-tab--active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <FiUsers />
          <span>User Directory & Moderation</span>
          <span className="admin-tab__badge">{totalUsers}</span>
        </button>
        <button
          className={`admin-tab ${activeTab === "comments" ? "admin-tab--active" : ""}`}
          onClick={() => setActiveTab("comments")}
        >
          <FiMessageSquare />
          <span>Content Moderation</span>
          <span className="admin-tab__badge">{totalComments}</span>
        </button>
        <button
          className={`admin-tab ${activeTab === "audit" ? "admin-tab--active" : ""}`}
          onClick={() => setActiveTab("audit")}
        >
          <FiFileText />
          <span>Audit Log Trail</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === "users" && (
        <section className="admin-section">
          <div className="admin-section__header">
            <div className="admin-section__title-group">
              <h2 className="admin-section__title">Registered Users</h2>
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
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {userSearch && (
                <button
                  className="admin-search-box__clear"
                  onClick={() => setUserSearch("")}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          <div className="admin-table-container">
            {loadingUsers ? (
              <div className="admin-table__cell--empty">
                <div className="admin-empty-state">
                  <FiRefreshCw className="admin-spin" size={24} />
                  <p>Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="admin-table__cell--empty">
                <div className="admin-empty-state">
                  <FiUsers size={32} />
                  <p>No users found matching your search</p>
                  <span>Try a different query or clear the filter</span>
                </div>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>2FA</th>
                    <th>Level & XP</th>
                    <th>Tasks</th>
                    <th>Joined</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="admin-table__row">
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-avatar">{getInitials(u.name)}</div>
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
                          <span className="admin-pill admin-pill--user">Member</span>
                        )}
                      </td>
                      <td>
                        {u.isSuspended ? (
                          <span
                            className="admin-pill admin-pill--suspended"
                            title={u.suspensionReason || "Account Suspended"}
                          >
                            <FiSlash /> Suspended
                          </span>
                        ) : (
                          <span className="admin-pill admin-pill--active">Active</span>
                        )}
                      </td>
                      <td>
                        {u.hasTwoFactorSecret ? (
                          <span className="admin-pill admin-pill--2fa-active">
                            <FiCheckCircle /> Configured
                          </span>
                        ) : (
                          <span className="admin-pill admin-pill--2fa-none">
                            <FiAlertCircle /> Off
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="admin-gamification-cell">
                          <span className="admin-level-badge">Lvl {u.level || 1}</span>
                          <span className="admin-xp-text">{u.xp || 0} XP</span>
                          {u.streak > 0 && (
                            <span className="admin-streak-badge">🔥 {u.streak}d</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="admin-task-count">
                          {u.totalTasksCompleted || 0}
                        </span>
                      </td>
                      <td>
                        <span className="admin-date-text">{formatDate(u.createdAt)}</span>
                      </td>
                      <td>
                        <span
                          className="admin-date-text"
                          title={formatDateTime(u.lastActive)}
                        >
                          {formatDate(u.lastActive)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-action-group">
                          <button
                            className="admin-btn admin-btn--sm admin-btn--primary"
                            onClick={() => handleOpenDetail(u._id)}
                          >
                            Details
                          </button>
                          <button
                            className={`admin-btn admin-btn--sm ${
                              u.isSuspended
                                ? "admin-btn--success"
                                : "admin-btn--warning"
                            }`}
                            onClick={() => handleToggleSuspension(u)}
                            title={u.isSuspended ? "Reactivate account" : "Suspend account"}
                          >
                            {u.isSuspended ? "Reactivate" : "Suspend"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loadingUsers && userPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination__info">
                Showing page <strong>{userPage}</strong> of <strong>{userPages}</strong> (
                {totalUsers} total)
              </span>
              <div className="admin-pagination__buttons">
                <button
                  className="admin-btn admin-btn--secondary admin-btn--sm"
                  onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
                  disabled={userPage <= 1}
                >
                  <FiChevronLeft /> Previous
                </button>
                <button
                  className="admin-btn admin-btn--secondary admin-btn--sm"
                  onClick={() => setUserPage((p) => Math.min(p + 1, userPages))}
                  disabled={userPage >= userPages}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: COMMENT MODERATION */}
      {activeTab === "comments" && (
        <section className="admin-section">
          <div className="admin-section__header">
            <div className="admin-section__title-group">
              <h2 className="admin-section__title">Comment Moderation</h2>
              <span className="admin-section__count">
                {totalComments} {totalComments === 1 ? "comment" : "comments"} found
              </span>
            </div>
            <div className="admin-search-box">
              <FiSearch className="admin-search-box__icon" />
              <input
                type="text"
                className="admin-search-box__input"
                placeholder="Search comment text..."
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
              />
              {commentSearch && (
                <button
                  className="admin-search-box__clear"
                  onClick={() => setCommentSearch("")}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          <div className="admin-table-container">
            {loadingComments ? (
              <div className="admin-table__cell--empty">
                <div className="admin-empty-state">
                  <FiRefreshCw className="admin-spin" size={24} />
                  <p>Loading comments...</p>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <div className="admin-table__cell--empty">
                <div className="admin-empty-state">
                  <FiMessageSquare size={32} />
                  <p>No comments found</p>
                </div>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Comment Content</th>
                    <th>Goal Context</th>
                    <th>Posted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((c) => (
                    <tr key={c._id} className="admin-table__row">
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-avatar">
                            {getInitials(c.authorId?.name)}
                          </div>
                          <div className="admin-user-info">
                            <span className="admin-user-name">
                              {c.authorId?.name || "Anonymous / Removed"}
                            </span>
                            <span className="admin-user-email">
                              {c.authorId?.email || ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-comment-text">{c.text}</div>
                      </td>
                      <td>
                        <span className="admin-comment-goal">
                          {c.goalId?.title || "Unknown Goal"}
                        </span>
                      </td>
                      <td>
                        <span className="admin-date-text">
                          {formatDateTime(c.createdAt)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="admin-btn admin-btn--sm admin-btn--danger"
                          onClick={() => handleDeleteComment(c)}
                          title="Delete comment as admin"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loadingComments && commentPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination__info">
                Showing page <strong>{commentPage}</strong> of{" "}
                <strong>{commentPages}</strong> ({totalComments} total)
              </span>
              <div className="admin-pagination__buttons">
                <button
                  className="admin-btn admin-btn--secondary admin-btn--sm"
                  onClick={() => setCommentPage((p) => Math.max(p - 1, 1))}
                  disabled={commentPage <= 1}
                >
                  <FiChevronLeft /> Previous
                </button>
                <button
                  className="admin-btn admin-btn--secondary admin-btn--sm"
                  onClick={() => setCommentPage((p) => Math.min(p + 1, commentPages))}
                  disabled={commentPage >= commentPages}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: AUDIT LOG TRAIL */}
      {activeTab === "audit" && (
        <section className="admin-section">
          <div className="admin-section__header">
            <div className="admin-section__title-group">
              <h2 className="admin-section__title">Administrative Audit Trail</h2>
              <span className="admin-section__count">
                {totalLogs} total logged actions
              </span>
            </div>
          </div>

          <div className="admin-table-container">
            {loadingAudit ? (
              <div className="admin-table__cell--empty">
                <div className="admin-empty-state">
                  <FiRefreshCw className="admin-spin" size={24} />
                  <p>Loading audit logs...</p>
                </div>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="admin-table__cell--empty">
                <div className="admin-empty-state">
                  <FiFileText size={32} />
                  <p>No audit logs recorded yet</p>
                  <span>Administrative updates and deletions will appear here</span>
                </div>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Admin Actor</th>
                    <th>Action</th>
                    <th>Target Type</th>
                    <th>Target Subject</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="admin-table__row">
                      <td>
                        <span className="admin-date-text">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-user-info">
                          <span className="admin-user-name">{log.actorName}</span>
                          <span className="admin-user-email">{log.actorEmail}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-audit-action">{log.action}</span>
                      </td>
                      <td>
                        <span className="admin-pill admin-pill--user">
                          {log.targetType}
                        </span>
                      </td>
                      <td>
                        <span className="admin-user-name">
                          {log.targetIdentifier || log.targetId || "N/A"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-audit-details">
                          {typeof log.details === "object"
                            ? JSON.stringify(log.details)
                            : String(log.details)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loadingAudit && auditPages > 1 && (
            <div className="admin-pagination">
              <span className="admin-pagination__info">
                Showing page <strong>{auditPage}</strong> of <strong>{auditPages}</strong>{" "}
                ({totalLogs} total)
              </span>
              <div className="admin-pagination__buttons">
                <button
                  className="admin-btn admin-btn--secondary admin-btn--sm"
                  onClick={() => setAuditPage((p) => Math.max(p - 1, 1))}
                  disabled={auditPage <= 1}
                >
                  <FiChevronLeft /> Previous
                </button>
                <button
                  className="admin-btn admin-btn--secondary admin-btn--sm"
                  onClick={() => setAuditPage((p) => Math.min(p + 1, auditPages))}
                  disabled={auditPage >= auditPages}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

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
              <div className="admin-table__cell--empty">
                <div className="admin-empty-state">
                  <FiRefreshCw className="admin-spin" size={24} />
                  <p>Loading user profile...</p>
                </div>
              </div>
            ) : (
              <div className="admin-modal__content">
                {/* Header Profile Info */}
                <div className="admin-modal__header">
                  <div className="admin-avatar admin-avatar--lg">
                    {getInitials(userDetail.name)}
                  </div>
                  <div>
                    <div className="admin-modal__title-row">
                      <h3 className="admin-modal__name">{userDetail.name}</h3>
                      {userDetail.isAdmin && (
                        <span className="admin-pill admin-pill--admin">
                          <FiShield /> Admin
                        </span>
                      )}
                      {userDetail.isSuspended && (
                        <span className="admin-pill admin-pill--suspended">
                          <FiSlash /> Suspended
                        </span>
                      )}
                    </div>
                    <span className="admin-modal__email">{userDetail.email}</span>
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

                {/* Moderation Controls Bar */}
                <h4 className="admin-modal__section-heading">Account Moderation Actions</h4>
                <div className="admin-modal__actions-bar">
                  <div className="admin-modal__action-row">
                    <div className="admin-modal__action-info">
                      <span className="admin-modal__action-title">Administrator Privilege</span>
                      <span className="admin-modal__action-desc">
                        {userDetail.isAdmin
                          ? "User currently holds system administrator privileges."
                          : "User is a regular platform member."}
                      </span>
                    </div>
                    <button
                      className={`admin-btn admin-btn--sm ${
                        userDetail.isAdmin ? "admin-btn--secondary" : "admin-btn--primary"
                      }`}
                      onClick={() => handleToggleAdmin(userDetail)}
                    >
                      {userDetail.isAdmin ? "Demote to Member" : "Promote to Admin"}
                    </button>
                  </div>

                  <div className="admin-modal__action-row">
                    <div className="admin-modal__action-info">
                      <span className="admin-modal__action-title">Account Suspension</span>
                      <span className="admin-modal__action-desc">
                        {userDetail.isSuspended
                          ? `Account suspended: ${userDetail.suspensionReason || "Administrative hold"}`
                          : "Account is active in good standing."}
                      </span>
                    </div>
                    <button
                      className={`admin-btn admin-btn--sm ${
                        userDetail.isSuspended ? "admin-btn--success" : "admin-btn--warning"
                      }`}
                      onClick={() => handleToggleSuspension(userDetail)}
                    >
                      {userDetail.isSuspended ? "Reactivate Account" : "Suspend Account"}
                    </button>
                  </div>

                  <div className="admin-modal__action-row">
                    <div className="admin-modal__action-info">
                      <span className="admin-modal__action-title">Two-Factor Authentication</span>
                      <span className="admin-modal__action-desc">
                        {userDetail.hasTwoFactorSecret
                          ? "2FA is active. Force reset if user is locked out."
                          : "2FA is not currently configured."}
                      </span>
                    </div>
                    <button
                      className="admin-btn admin-btn--sm admin-btn--secondary"
                      onClick={() => handleForceReset2FA(userDetail)}
                      disabled={!userDetail.hasTwoFactorSecret}
                    >
                      <FiKey /> Reset 2FA
                    </button>
                  </div>

                  <div className="admin-modal__action-row">
                    <div className="admin-modal__action-info">
                      <span className="admin-modal__action-title">Danger Zone</span>
                      <span className="admin-modal__action-desc">
                        Permanently delete this user and cascade all goals, tasks, and comments.
                      </span>
                    </div>
                    <button
                      className="admin-btn admin-btn--sm admin-btn--danger"
                      onClick={() => handleDeleteUser(userDetail)}
                    >
                      <FiTrash2 /> Delete User Account
                    </button>
                  </div>
                </div>

                {/* Grid: Resource Activity */}
                <h4 className="admin-modal__section-heading">Platform Engagement</h4>
                <div className="admin-modal__stats-grid">
                  <div className="admin-modal__stat-card">
                    <span className="admin-modal__stat-number">
                      {userDetail.goalsCount || 0}
                    </span>
                    <span className="admin-modal__stat-text">Active Goals</span>
                  </div>
                  <div className="admin-modal__stat-card">
                    <span className="admin-modal__stat-number">
                      {userDetail.tasksCount || 0}
                    </span>
                    <span className="admin-modal__stat-text">Total Tasks</span>
                  </div>
                  <div className="admin-modal__stat-card">
                    <span className="admin-modal__stat-number">
                      {userDetail.subtasksCount || 0}
                    </span>
                    <span className="admin-modal__stat-text">Subtasks</span>
                  </div>
                </div>

                {/* Gamification Stats */}
                <h4 className="admin-modal__section-heading">Productivity & Habits</h4>
                <div className="admin-modal__gamification-grid">
                  <div className="admin-modal__gamification-item">
                    <span>Level</span>
                    <span className="admin-level-badge">Lvl {userDetail.level || 1}</span>
                  </div>
                  <div className="admin-modal__gamification-item">
                    <span>Total XP</span>
                    <span>{userDetail.xp || 0} XP</span>
                  </div>
                  <div className="admin-modal__gamification-item">
                    <span>Active Streak</span>
                    <span>🔥 {userDetail.streak || 0} days</span>
                  </div>
                  <div className="admin-modal__gamification-item">
                    <span>Completed Tasks</span>
                    <span>
                      <FiCheckCircle /> {userDetail.totalTasksCompleted || 0}
                    </span>
                  </div>
                  <div className="admin-modal__gamification-item">
                    <span>Completed Goals</span>
                    <span>
                      <FiTarget /> {userDetail.totalGoalsCompleted || 0}
                    </span>
                  </div>
                  <div className="admin-modal__gamification-item">
                    <span>Pomodoro Sessions</span>
                    <span>
                      <FiClock /> {userDetail.totalPomodorosCompleted || 0}
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

      {/* Action Confirmation Modal */}
      {confirmModal.isOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className={`admin-modal ${
              confirmModal.isDanger ? "admin-modal--danger" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
          >
            <div className="admin-modal__title-row" style={{ marginBottom: 12 }}>
              <FiAlertTriangle
                style={{
                  color: confirmModal.isDanger ? "#ef4444" : "#f59e0b",
                  fontSize: 22,
                }}
              />
              <h3 className="admin-modal__name">{confirmModal.title}</h3>
            </div>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.5, margin: 0 }}>
              {confirmModal.message}
            </p>

            {confirmModal.inputReason && (
              <div style={{ marginTop: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: "#334155",
                  }}
                >
                  Reason for suspension:
                </label>
                <input
                  type="text"
                  className="admin-search-box__input"
                  value={confirmModal.reason}
                  onChange={(e) =>
                    setConfirmModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="e.g. Terms of Service violation"
                />
              </div>
            )}

            <div className="admin-modal__footer">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </button>
              <button
                className={`admin-btn ${
                  confirmModal.isDanger ? "admin-btn--danger" : "admin-btn--primary"
                }`}
                onClick={async () => {
                  const reason = confirmModal.reason;
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  if (confirmModal.confirmAction) {
                    await confirmModal.confirmAction(reason);
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
