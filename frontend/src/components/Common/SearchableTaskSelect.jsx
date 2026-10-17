import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiSearch, FiChevronDown, FiX, FiCheck, FiCheckSquare } from "react-icons/fi";
import "./SearchableTaskSelect.css";

const SearchableTaskSelect = ({
  tasks = [],
  value = "",
  onChange,
  placeholder = "Select a Task...",
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  const selectedTask = useMemo(
    () => tasks.find((t) => t._id === value),
    [tasks, value]
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      setHighlightedIndex(0);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Filtered tasks based on searchQuery
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((t) => {
      const nameMatch = (t.name || "").toLowerCase().includes(q);
      const descMatch = (t.description || "").toLowerCase().includes(q);
      const priorityMatch = (t.priority || "").toLowerCase().includes(q);
      return nameMatch || descMatch || priorityMatch;
    });
  }, [tasks, searchQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelectTask = (taskId) => {
    onChange?.(taskId);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setSearchQuery("");
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredTasks.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredTasks.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTasks[highlightedIndex]) {
        handleSelectTask(filteredTasks[highlightedIndex]._id);
      }
    }
  };

  const formatShortDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-task-select ${isOpen ? "open" : ""} ${
        disabled ? "disabled" : ""
      }`}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input to ensure HTML5 form validation respects "required" */}
      <input
        type="text"
        value={value}
        required={required}
        onChange={() => {}}
        className="searchable-task-select__native-input"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Main Trigger Button */}
      <div
        className={`searchable-task-select__trigger ${
          selectedTask ? "has-value" : ""
        }`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
      >
        <div className="searchable-task-select__trigger-content">
          <FiCheckSquare className="searchable-task-select__icon" size={16} />
          {selectedTask ? (
            <div className="searchable-task-select__selected-info">
              <span className="searchable-task-select__selected-title">
                {selectedTask.name}
              </span>
              {selectedTask.priority && (
                <span
                  className={`searchable-task-select__priority-pill priority-${selectedTask.priority.toLowerCase()}`}
                >
                  {selectedTask.priority}
                </span>
              )}
            </div>
          ) : (
            <span className="searchable-task-select__placeholder">
              {placeholder}
            </span>
          )}
        </div>

        <div className="searchable-task-select__trigger-actions">
          {selectedTask && !disabled && (
            <button
              type="button"
              className="searchable-task-select__clear-btn"
              onClick={handleClear}
              title="Clear selection"
              aria-label="Clear task selection"
            >
              <FiX size={14} />
            </button>
          )}
          <FiChevronDown
            className={`searchable-task-select__chevron ${
              isOpen ? "rotated" : ""
            }`}
            size={16}
          />
        </div>
      </div>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="searchable-task-select__popover">
          {/* Quick Search Header */}
          <div className="searchable-task-select__search-header">
            <FiSearch
              className="searchable-task-select__search-icon"
              size={15}
            />
            <input
              ref={searchInputRef}
              type="text"
              className="searchable-task-select__search-input"
              placeholder="Search tasks by name or priority..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label="Search tasks"
            />
            {searchQuery && (
              <button
                type="button"
                className="searchable-task-select__search-clear"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* Tasks List */}
          <div
            ref={listRef}
            className="searchable-task-select__list"
            role="listbox"
          >
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => {
                const isSelected = task._id === value;
                const isHighlighted = index === highlightedIndex;
                const dateSpan =
                  task.startDate && task.endDate
                    ? `${formatShortDate(task.startDate)} – ${formatShortDate(
                        task.endDate
                      )}`
                    : null;

                return (
                  <div
                    key={task._id}
                    className={`searchable-task-select__option ${
                      isSelected ? "selected" : ""
                    } ${isHighlighted ? "highlighted" : ""}`}
                    onClick={() => handleSelectTask(task._id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="searchable-task-select__option-left">
                      <span className="searchable-task-select__option-title">
                        {task.name}
                      </span>
                      <div className="searchable-task-select__option-meta">
                        {task.priority && (
                          <span
                            className={`searchable-task-select__priority-pill priority-${task.priority.toLowerCase()}`}
                          >
                            {task.priority}
                          </span>
                        )}
                        {dateSpan && (
                          <span className="searchable-task-select__date-pill">
                            {dateSpan}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <FiCheck
                        className="searchable-task-select__option-check"
                        size={16}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="searchable-task-select__empty">
                <span>No tasks match "{searchQuery}"</span>
                <button
                  type="button"
                  className="searchable-task-select__empty-clear"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Footer showing count */}
          <div className="searchable-task-select__footer">
            <span>
              {filteredTasks.length} of {tasks.length} tasks
            </span>
            <span className="searchable-task-select__hint">
              Use ↑↓ keys to navigate
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableTaskSelect;
