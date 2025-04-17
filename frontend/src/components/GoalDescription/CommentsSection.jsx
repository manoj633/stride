// CommentsSection.jsx
import React from "react";
import "./CommentsSection.css";

const CommentsSection = ({ comments, comment, onAddComment, setComment }) => {
  // Function to format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to detect and make URLs clickable
  const formatText = (text) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    if (!text) return "";

    // Split by URLs and map to JSX elements
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      // Check if part matches URL pattern
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="comment-link"
          >
            <span className="link-emoji">🔗</span> {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Get a random emoji for each comment
  const getCommentEmoji = () => {
    const emojis = ["💡", "✨", "📝", "🔍", "💭", "📌", "🌟", "✅", "🎯", "📊"];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div className="goal-description__comments">
      <h3>
        <span className="section-emoji">📋</span> Notes & Comments
      </h3>
      <div className="comment-input">
        <textarea
          placeholder="Add a note... ✏️"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        <button onClick={onAddComment}>
          <span className="button-emoji">✨</span> Add Note
        </button>
      </div>
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">
            <span className="empty-emoji">📭</span> No comments yet. Be the
            first to add a note!
          </p>
        ) : (
          comments.map((comment) => (
            <div className="comment-item" key={comment.id}>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-emoji">{getCommentEmoji()}</span>
                </div>
                <p className="comment-text">{formatText(comment.text)}</p>
                <span className="comment-date">
                  <span className="date-emoji">🕒</span>{" "}
                  {formatDate(comment.date)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
