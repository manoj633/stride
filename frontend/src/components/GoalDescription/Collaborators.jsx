// Collaborators.jsx
import React from "react";

const Collaborators = ({ collaborators }) => (
  <div className="goal-description__collaborators">
    <h3>Team Members</h3>
    <div className="collaborators-list">
      {collaborators.map((member) => (
        <div className="collaborator-avatar" key={member.id}>
          <img src={member.avatar} alt={`Avatar of ${member.name}`} />
          <span>{member.name}</span>
        </div>
      ))}
    </div>
    <button className="add-collaborator" aria-label="Add a new team member">
      + Add Member
    </button>
  </div>
);

export default Collaborators;
