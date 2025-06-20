import React, { useEffect, useState, useRef } from "react";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import "./NotificationBell.css";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";

const NotificationBell = ({ onClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bellRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/notifications");
        setNotifications(res.data.slice(0, 5));
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      } catch (err) {
        setError("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <LoadingSpinner message="Loading notifications..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="notif-bell-wrapper" ref={bellRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Show notifications"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span
            className="notif-badge"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">Notifications</div>
          {notifications.length === 0 && (
            <div className="notif-empty">No notifications</div>
          )}
          <ul role="list" aria-label="Recent notifications">
            {notifications.map((n) => (
              <li key={n._id} className={n.isRead ? "read" : "unread"}>
                <div className="notif-title">{n.title}</div>
                <div
                  className="notif-message"
                  dangerouslySetInnerHTML={{ __html: n.message }}
                />
                <div className="notif-meta">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
          <div className="notif-dropdown-footer">
            <button
              className="notif-view-all-btn"
              onClick={() => {
                setOpen(false);
                navigate("/notifications");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#4285f4",
                cursor: "pointer",
                padding: 0,
                fontSize: "1em",
              }}
              aria-label="View all notifications"
            >
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
