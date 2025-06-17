import React, { useEffect, useState, useRef } from "react";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import "./NotificationBell.css";

const NotificationBell = ({ onClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const bellRef = useRef();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications");
        setNotifications(res.data.slice(0, 5));
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      } catch (err) {
        // ignore
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

  return (
    <div className="notif-bell-wrapper" ref={bellRef}>
      <button className="notif-bell-btn" onClick={() => setOpen((o) => !o)}>
        <FiBell size={22} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">Notifications</div>
          {notifications.length === 0 && (
            <div className="notif-empty">No notifications</div>
          )}
          <ul>
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
            <a href="/notifications">View all</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
