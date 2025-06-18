import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";
import { motion, AnimatePresence } from "framer-motion"; // You'll need to install framer-motion

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/notifications");
        setNotifications(res.data);
      } catch (err) {
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setError("Failed to mark as read");
    }
  };

  const getRandomEmoji = () => {
    const emojis = ["✨", "🎉", "🎊", "🌟", "💫", "📣", "📢", "🔔", "💌", "📮"];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  if (loading)
    return (
      <div className="notifications-container">
        <div className="notifications loading">
          <div className="loading-animation">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p>Loading your updates...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="notifications-container">
        <div className="notifications error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
            aria-label="Retry loading notifications"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="notifications-container">
      <motion.div
        className="notifications"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="notifications-header">
          <div className="bell-icon">🔔</div>
          <h3>Your Updates</h3>
          <div className="notif-count">{notifications.length}</div>
        </div>

        {notifications.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>Nothing to see here yet!</p>
            <span>We'll notify you when something happens</span>
          </div>
        )}

        <AnimatePresence>
          <ul
            className="notifications-list"
            role="list"
            aria-label="All notifications"
          >
            {notifications.map((n) => (
              <motion.li
                key={n._id}
                className={`notification-item ${n.isRead ? "read" : "unread"}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="notif-emoji">{getRandomEmoji()}</div>
                <div className="notif-content">
                  <div className="notif-title">{n.title}</div>
                  <div
                    className="notif-message"
                    dangerouslySetInnerHTML={{ __html: n.message }}
                  />
                  <div className="notif-meta">
                    <span className="notif-time">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                    {!n.isRead && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mark-read-button"
                        onClick={() => markAsRead(n._id)}
                      >
                        Mark as read
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Notifications;
