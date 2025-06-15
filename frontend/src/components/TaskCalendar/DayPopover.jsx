import React from "react";

const DayPopover = ({ date, items, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>
            {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </h2>
          <button className="button secondary" onClick={onClose}>Close</button>
        </div>
        <hr />
        {items && items.length > 0 ? (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {items.map(item => (
              <li key={item.id} style={{ marginBottom: "0.75rem" }}>
                <span style={{ fontWeight: 600 }}>{item.text}</span>
                <span style={{ marginLeft: 8, fontSize: "0.85em", color: "#888" }}>
                  [{item.type}]
                </span>
                {item.completed && (
                  <span style={{ marginLeft: 8, color: "#32d583" }}>✓</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ color: "#888", marginTop: "1rem" }}>No tasks or subtasks for this day.</div>
        )}
      </div>
    </div>
  );
};

export default DayPopover;