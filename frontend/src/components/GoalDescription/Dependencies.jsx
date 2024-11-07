// Dependencies.jsx
import React from "react";

const Dependencies = ({ dependencies }) => (
  <div className="goal-description__dependencies">
    <h3>Dependencies</h3>
    <div className="dependencies-list">
      {dependencies.map((dep) => (
        <div className="dependency-item" key={dep.id}>
          <span className="dependency-title">{dep.title}</span>
          <span className="dependency-status">{dep.status}</span>
        </div>
      ))}
    </div>
  </div>
);

export default Dependencies;
