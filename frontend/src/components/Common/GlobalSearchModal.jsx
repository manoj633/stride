import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { searchAPI } from "../../services/api/urlService";
import {
  FiSearch,
  FiX,
  FiTarget,
  FiCheckSquare,
  FiList,
  FiCalendar,
  FiChevronRight,
  FiAlertCircle,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";
import "./GlobalSearchModal.css";

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "goals" | "tasks" | "subtasks"
  const [results, setResults] = useState({ total: 0, goals: [], tasks: [], subtasks: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setResults({ total: 0, goals: [], tasks: [], subtasks: [] });
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener handled by parent, Esc handled here
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults({ total: 0, goals: [], tasks: [], subtasks: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await searchAPI.searchAll(query.trim());
        setResults(data || { total: 0, goals: [], tasks: [], subtasks: [] });
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search query error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Flattened displayed items for keyboard navigation based on activeTab
  const displayedItems = useMemo(() => {
    if (activeTab === "goals") return results.goals;
    if (activeTab === "tasks") return results.tasks;
    if (activeTab === "subtasks") return results.subtasks;
    return [...results.goals, ...results.tasks, ...results.subtasks];
  }, [activeTab, results]);

  // Keyboard navigation across items
  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < displayedItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : displayedItems.length - 1
      );
    } else if (e.key === "Enter" && displayedItems.length > 0) {
      e.preventDefault();
      const selected = displayedItems[selectedIndex];
      if (selected) {
        handleSelectItem(selected);
      }
    }
  };

  const handleSelectItem = (item) => {
    onClose();
    if (item.url) {
      navigate(item.url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-backdrop" onClick={onClose}>
      <div
        className="global-search-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search goals and tasks"
      >
        {/* Search Input Box */}
        <div className="global-search-header">
          <FiSearch className="global-search-header__icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="global-search-input"
            placeholder="Search across all goals, tasks, and subtasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          {loading && <div className="global-search-spinner" />}
          {query && !loading && (
            <button
              type="button"
              className="global-search-clear-btn"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search input"
            >
              <FiX size={16} />
            </button>
          )}
          <span className="global-search-kbd">ESC</span>
        </div>

        {/* Scope Tabs (when results or query active) */}
        {query.trim().length > 0 && (
          <div className="global-search-tabs">
            <button
              type="button"
              className={`global-search-tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("all");
                setSelectedIndex(0);
              }}
            >
              All ({results.total})
            </button>
            <button
              type="button"
              className={`global-search-tab ${activeTab === "goals" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("goals");
                setSelectedIndex(0);
              }}
            >
              <FiTarget size={13} /> Goals ({results.goals.length})
            </button>
            <button
              type="button"
              className={`global-search-tab ${activeTab === "tasks" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("tasks");
                setSelectedIndex(0);
              }}
            >
              <FiCheckSquare size={13} /> Tasks ({results.tasks.length})
            </button>
            <button
              type="button"
              className={`global-search-tab ${activeTab === "subtasks" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("subtasks");
                setSelectedIndex(0);
              }}
            >
              <FiList size={13} /> Subtasks ({results.subtasks.length})
            </button>
          </div>
        )}

        {/* Results Body */}
        <div className="global-search-body">
          {/* Empty Query: Quick suggestions state */}
          {!query.trim() && (
            <div className="global-search-empty-prompt">
              <div className="global-search-empty-icon">
                <FiSearch size={28} />
              </div>
              <h4>Search anything in Stride</h4>
              <p>Type any keyword to find goals, tasks, or subtasks across all years.</p>
              <div className="global-search-suggestions">
                <span className="global-search-suggestions__title">Try searching:</span>
                <div className="global-search-suggestion-chips">
                  {["High", "Personal", "Health", "Career", "2024", "2025"].map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      className="global-search-chip"
                      onClick={() => setQuery(hint)}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Query: No results found */}
          {query.trim().length > 0 && !loading && displayedItems.length === 0 && (
            <div className="global-search-no-results">
              <FiAlertCircle size={24} className="no-results-icon" />
              <p className="no-results-title">No matches found for "{query}"</p>
              <p className="no-results-subtitle">
                Try searching for a different keyword, category, or checking spelling.
              </p>
            </div>
          )}

          {/* Active Results List */}
          {displayedItems.length > 0 && (
            <div className="global-search-results-list" role="listbox">
              {displayedItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const isGoal = item.type === "goal";
                const isTask = item.type === "task";
                const isSubtask = item.type === "subtask";

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`global-search-result-row ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className={`result-type-icon result-type-icon--${item.type}`}>
                      {isGoal && <FiTarget size={16} />}
                      {isTask && <FiCheckSquare size={16} />}
                      {isSubtask && <FiList size={16} />}
                    </div>

                    <div className="result-content">
                      <div className="result-title-line">
                        <span className="result-title">{item.title}</span>
                        <div className="result-badges">
                          {item.year && (
                            <span className="result-badge result-badge--year">
                              {item.year}
                            </span>
                          )}
                          {item.priority && (
                            <span
                              className={`result-badge result-badge--priority-${item.priority.toLowerCase()}`}
                            >
                              {item.priority}
                            </span>
                          )}
                          {isGoal && item.category && (
                            <span className="result-badge result-badge--category">
                              {item.category}
                            </span>
                          )}
                          {item.completed && (
                            <span className="result-badge result-badge--completed">
                              Done
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta context line */}
                      <div className="result-meta-line">
                        {isTask && item.goalTitle && (
                          <span className="result-context">
                            Goal: <strong>{item.goalTitle}</strong>
                          </span>
                        )}
                        {isSubtask && (
                          <span className="result-context">
                            {item.taskName && `Task: ${item.taskName}`}
                            {item.goalTitle && ` • Goal: ${item.goalTitle}`}
                          </span>
                        )}
                        {isGoal && item.description && (
                          <span className="result-desc">{item.description}</span>
                        )}
                        {isTask && item.description && !item.goalTitle && (
                          <span className="result-desc">{item.description}</span>
                        )}
                      </div>
                    </div>

                    <FiChevronRight className="result-chevron" size={16} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer with navigation shortcuts */}
        <div className="global-search-footer">
          <div className="search-keyboard-hints">
            <span>
              <kbd className="hint-kbd">↑</kbd> <kbd className="hint-kbd">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="hint-kbd">↵</kbd> to select
            </span>
            <span>
              <kbd className="hint-kbd">esc</kbd> to close
            </span>
          </div>
          <span className="search-results-count">
            {displayedItems.length > 0 && `${displayedItems.length} matching items`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
