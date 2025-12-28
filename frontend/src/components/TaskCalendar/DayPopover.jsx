import React from "react";
import {
  X,
  CheckCircle2,
  Circle,
  Target,
  ListTodo,
  Layers,
} from "lucide-react";

const DayPopover = ({ date, items, onClose }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case "goal":
        return <Target className="w-4 h-4" />;
      case "task":
        return <ListTodo className="w-4 h-4" />;
      case "subtask":
        return <Layers className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-green-100 text-green-700 border-green-200",
    };
    return (
      colors[priority?.toLowerCase()] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  const completedItems = items.filter((item) => item.completed);
  const pendingItems = items.filter((item) => !item.completed);
  const completionRate =
    items.length > 0
      ? Math.round((completedItems.length / items.length) * 100)
      : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal day-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1rem",
              gap: "1rem",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.3,
                flex: 1,
              }}
            >
              {date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                padding: "0.5rem",
                border: "none",
                background: "#f8fafc",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f8fafc";
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Stats Bar */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              padding: "1rem",
              background: "#f8fafc",
              borderRadius: "12px",
              marginBottom: "1rem",
            }}
          >
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#6366f1",
                }}
              >
                {items.length}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                Total Items
              </div>
            </div>
            <div
              style={{
                width: "1px",
                background: "rgba(99, 102, 241, 0.2)",
              }}
            />
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#10b981",
                }}
              >
                {completedItems.length}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                Completed
              </div>
            </div>
            <div
              style={{
                width: "1px",
                background: "rgba(99, 102, 241, 0.2)",
              }}
            />
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#6366f1",
                }}
              >
                {completionRate}%
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                Progress
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {items.length > 0 && (
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#f8fafc",
                borderRadius: "999px",
                overflow: "hidden",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  width: `${completionRate}%`,
                  height: "100%",
                  background: "#10b981",
                  borderRadius: "999px",
                  transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
          )}
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e2e8f0",
            margin: "1.5rem 0",
          }}
        />

        {/* Items List */}
        {items && items.length > 0 ? (
          <div className="modal-content-scrollable">
            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Pending ({pendingItems.length})
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {pendingItems.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        padding: "1rem",
                        marginBottom: "0.625rem",
                        background: "white",
                        border: "2px solid #e2e8f0",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#6366f1";
                        e.currentTarget.style.transform = "translateX(3px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 6px -1px rgb(0 0 0 / 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        {getTypeIcon(item.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#0f172a",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.text}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#64748b",
                            marginTop: "0.25rem",
                          }}
                        >
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}
                        </div>
                      </div>
                      <span
                        className={getPriorityBadge(item.priority)}
                        style={{
                          padding: "0.25rem 0.625rem",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: "1px solid",
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Completed Items */}
            {completedItems.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#10b981",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Completed ({completedItems.length})
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {completedItems.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        padding: "1rem",
                        marginBottom: "0.625rem",
                        background: "#f8fafc",
                        border: "2px solid #e2e8f0",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        opacity: 0.7,
                      }}
                    >
                      <div
                        style={{
                          color: "#10b981",
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#64748b",
                            textDecoration: "line-through",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.text}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                            marginTop: "0.25rem",
                          }}
                        >
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}
                        </div>
                      </div>
                      <span
                        className={getPriorityBadge(item.priority)}
                        style={{
                          padding: "0.25rem 0.625rem",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: "1px solid",
                          opacity: 0.6,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            <Circle
              size={48}
              style={{
                margin: "0 auto 1rem",
                opacity: 0.3,
              }}
            />
            <div style={{ fontSize: "1rem", fontWeight: 500 }}>
              No tasks or subtasks for this day
            </div>
            <div style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Click on a day to add new items
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayPopover;
