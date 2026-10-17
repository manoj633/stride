import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiSearch, FiChevronDown, FiX, FiCheck, FiTarget } from "react-icons/fi";
import "./SearchableGoalSelect.css";

const SearchableGoalSelect = ({
  goals = [],
  value = "",
  onChange,
  placeholder = "Select a Goal...",
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  const selectedGoal = useMemo(
    () => goals.find((g) => g._id === value),
    [goals, value]
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

  // Filtered goals based on searchQuery
  const filteredGoals = useMemo(() => {
    if (!searchQuery.trim()) return goals;
    const q = searchQuery.trim().toLowerCase();
    return goals.filter((g) => {
      const titleMatch = (g.title || "").toLowerCase().includes(q);
      const categoryMatch = (g.category || "").toLowerCase().includes(q);
      const yearMatch = g.duration?.startDate
        ? String(new Date(g.duration.startDate).getFullYear()).includes(q)
        : false;
      return titleMatch || categoryMatch || yearMatch;
    });
  }, [goals, searchQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelectGoal = (goalId) => {
    onChange?.(goalId);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setSearchQuery("");
  };

  const handleKeyDown = (e) => {
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
        prev < filteredGoals.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredGoals.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredGoals[highlightedIndex]) {
        handleSelectGoal(filteredGoals[highlightedIndex]._id);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-goal-select ${isOpen ? "open" : ""} ${
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
        className="searchable-goal-select__native-input"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Main Trigger Button */}
      <div
        className={`searchable-goal-select__trigger ${
          selectedGoal ? "has-value" : ""
        }`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
      >
        <div className="searchable-goal-select__trigger-content">
          <FiTarget className="searchable-goal-select__icon" size={16} />
          {selectedGoal ? (
            <div className="searchable-goal-select__selected-info">
              <span className="searchable-goal-select__selected-title">
                {selectedGoal.title}
              </span>
              {selectedGoal.category && (
                <span className="searchable-goal-select__category-pill">
                  {selectedGoal.category}
                </span>
              )}
            </div>
          ) : (
            <span className="searchable-goal-select__placeholder">
              {placeholder}
            </span>
          )}
        </div>

        <div className="searchable-goal-select__trigger-actions">
          {selectedGoal && !disabled && (
            <button
              type="button"
              className="searchable-goal-select__clear-btn"
              onClick={handleClear}
              title="Clear selection"
              aria-label="Clear goal selection"
            >
              <FiX size={14} />
            </button>
          )}
          <FiChevronDown
            className={`searchable-goal-select__chevron ${
              isOpen ? "rotated" : ""
            }`}
            size={16}
          />
        </div>
      </div>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="searchable-goal-select__popover">
          {/* Quick Search Header */}
          <div className="searchable-goal-select__search-header">
            <FiSearch
              className="searchable-goal-select__search-icon"
              size={15}
            />
            <input
              ref={searchInputRef}
              type="text"
              className="searchable-goal-select__search-input"
              placeholder="Search goals by title or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label="Search goals"
            />
            {searchQuery && (
              <button
                type="button"
                className="searchable-goal-select__search-clear"
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

          {/* Goals List */}
          <div
            ref={listRef}
            className="searchable-goal-select__list"
            role="listbox"
          >
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal, index) => {
                const isSelected = goal._id === value;
                const isHighlighted = index === highlightedIndex;
                const year = goal.duration?.startDate
                  ? new Date(goal.duration.startDate).getFullYear()
                  : null;

                return (
                  <div
                    key={goal._id}
                    className={`searchable-goal-select__option ${
                      isSelected ? "selected" : ""
                    } ${isHighlighted ? "highlighted" : ""}`}
                    onClick={() => handleSelectGoal(goal._id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="searchable-goal-select__option-left">
                      <span className="searchable-goal-select__option-title">
                        {goal.title}
                      </span>
                      <div className="searchable-goal-select__option-meta">
                        {goal.category && (
                          <span className="searchable-goal-select__category-pill">
                            {goal.category}
                          </span>
                        )}
                        {year && (
                          <span className="searchable-goal-select__year-pill">
                            {year}
                          </span>
                        )}
                        {goal.priority && (
                          <span
                            className={`searchable-goal-select__priority-pill priority-${goal.priority.toLowerCase()}`}
                          >
                            {goal.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <FiCheck
                        className="searchable-goal-select__option-check"
                        size={16}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="searchable-goal-select__empty">
                <span>No goals match "{searchQuery}"</span>
                <button
                  type="button"
                  className="searchable-goal-select__empty-clear"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Footer showing count */}
          <div className="searchable-goal-select__footer">
            <span>
              {filteredGoals.length} of {goals.length} goals
            </span>
            <span className="searchable-goal-select__hint">
              Use ↑↓ keys to navigate
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableGoalSelect;
