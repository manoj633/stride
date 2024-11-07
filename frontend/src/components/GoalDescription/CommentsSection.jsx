// CommentsSection.jsx
import React from "react";

const CommentsSection = ({ comments, comment, onAddComment, setComment }) => (
  <div className="goal-description__comments">
    <h3>Notes & Comments</h3>
    <div className="comment-input">
      <textarea
        placeholder="Add a note..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
      <button onClick={onAddComment}>Add Note</button>
    </div>
    <div className="comments-list">
      {comments.map((comment) => (
        <div className="comment-item" key={comment.id}>
          <p>{comment.text}</p>
          <span>{comment.date}</span>
        </div>
      ))}
    </div>
  </div>
);

export default CommentsSection;
