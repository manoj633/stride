// CommentsSection.jsx
import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import "./CommentsSection.css";

const CommentsSection = ({
  comments = [],
  comment,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  currentUserId,
  isAdmin,
  setComment,
}) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Function to format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "";
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
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (!text) return "";

    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
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

  // Deterministic emoji based on comment ID/text to prevent re-render flickering
  const getCommentEmoji = (keyString) => {
    const emojis = ["💡", "✨", "📝", "🔍", "💭", "📌", "🌟", "✅", "🎯", "📊"];
    if (!keyString) return emojis[0];
    let hash = 0;
    for (let i = 0; i < keyString.length; i++) {
      hash = (hash << 5) - hash + keyString.charCodeAt(i);
      hash |= 0;
    }
    return emojis[Math.abs(hash) % emojis.length];
  };

  const handleStartEdit = (c) => {
    setEditingCommentId(c._id || c.id);
    setEditText(c.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim() || !onUpdateComment) return;
    setIsSubmittingEdit(true);
    try {
      await onUpdateComment(commentId, editText.trim());
      setEditingCommentId(null);
      setEditText("");
    } finally {
      setIsSubmittingEdit(false);
    }
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
          maxLength={500}
        ></textarea>
        <button onClick={onAddComment} disabled={!comment.trim()}>
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
          comments.map((c) => {
            const commentId = c._id || c.id;
            const author = c.authorId;
            const authorId = author?._id || author;
            const authorName = author?.name || "Author";
            const isAuthor = Boolean(
              currentUserId && authorId && String(authorId) === String(currentUserId)
            );
            const canEdit = Boolean(isAuthor && onUpdateComment);
            const canDelete = Boolean((isAuthor || isAdmin) && onDeleteComment);
            const isEditing = editingCommentId === commentId;

            return (
              <div className="comment-item" key={commentId}>
                <div className="comment-content">
                  <div className="comment-header">
                    <div className="comment-author-info">
                      <span className="comment-emoji">
                        {getCommentEmoji(String(commentId))}
                      </span>
                      <span className="comment-author-name">{authorName}</span>
                    </div>

                    {!isEditing && (canEdit || canDelete) && (
                      <div className="comment-actions">
                        {canEdit && (
                          <button
                            type="button"
                            className="comment-action-btn comment-action-btn--edit"
                            onClick={() => handleStartEdit(c)}
                            title="Edit comment"
                            aria-label="Edit comment"
                          >
                            <FiEdit2 />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="comment-action-btn comment-action-btn--delete"
                            onClick={() => onDeleteComment(commentId)}
                            title="Delete comment"
                            aria-label="Delete comment"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="comment-edit-box">
                      <textarea
                        className="comment-edit-textarea"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        maxLength={500}
                        rows={3}
                        placeholder="Update your note..."
                        autoFocus
                      />
                      <div className="comment-edit-actions">
                        <button
                          type="button"
                          className="comment-edit-btn comment-edit-btn--cancel"
                          onClick={handleCancelEdit}
                          disabled={isSubmittingEdit}
                        >
                          <FiX /> Cancel
                        </button>
                        <button
                          type="button"
                          className="comment-edit-btn comment-edit-btn--save"
                          onClick={() => handleSaveEdit(commentId)}
                          disabled={isSubmittingEdit || !editText.trim()}
                        >
                          <FiCheck /> {isSubmittingEdit ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="comment-text">{formatText(c.text)}</p>
                      <div className="comment-footer">
                        <span className="comment-date">
                          <span className="date-emoji">🕒</span>{" "}
                          {formatDate(c.date || c.createdAt)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
