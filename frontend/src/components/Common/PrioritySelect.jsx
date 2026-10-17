import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import "./PrioritySelect.css";

const PRIORITIES = [
  {
    value: "High",
    label: "High Priority",
    shortLabel: "High",
    color: "#ef4444",
    bgColor: "#fee2e2",
    textColor: "#b91c1c",
    borderColor: "#fca5a5",
  },
  {
    value: "Medium",
    label: "Medium Priority",
    shortLabel: "Medium",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    textColor: "#b45309",
    borderColor: "#fde68a",
  },
  {
    value: "Low",
    label: "Low Priority",
    shortLabel: "Low",
    color: "#10b981",
    bgColor: "#dcfce7",
    textColor: "#15803d",
    borderColor: "#86efac",
  },
];

const PrioritySelect = ({
  value = "Medium",
  onChange,
  disabled = false,
  id = "priority-select",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedPriority =
    PRIORITIES.find(
      (p) => p.value.toLowerCase() === (value || "Medium").toLowerCase()
    ) || PRIORITIES[1];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`priority-select ${isOpen ? "open" : ""} ${
        disabled ? "disabled" : ""
      }`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        className="priority-select__trigger"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <div className="priority-select__trigger-content">
          <span
            className="priority-select__dot"
            style={{ backgroundColor: selectedPriority.color }}
          />
          <span
            className="priority-select__badge"
            style={{
              backgroundColor: selectedPriority.bgColor,
              color: selectedPriority.textColor,
              borderColor: selectedPriority.borderColor,
            }}
          >
            {selectedPriority.shortLabel}
          </span>
        </div>
        <FiChevronDown
          className={`priority-select__chevron ${isOpen ? "rotated" : ""}`}
          size={16}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className="priority-select__menu"
          role="listbox"
          aria-label="Priority options"
        >
          {PRIORITIES.map((priority) => {
            const isSelected =
              priority.value.toLowerCase() === selectedPriority.value.toLowerCase();

            return (
              <div
                key={priority.value}
                className={`priority-select__option priority-select__option--${priority.value.toLowerCase()} ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => handleSelect(priority.value)}
                role="option"
                aria-selected={isSelected}
              >
                <div className="priority-select__option-left">
                  <span
                    className="priority-select__dot"
                    style={{ backgroundColor: priority.color }}
                  />
                  <span
                    className="priority-select__badge"
                    style={{
                      backgroundColor: priority.bgColor,
                      color: priority.textColor,
                      borderColor: priority.borderColor,
                    }}
                  >
                    {priority.shortLabel}
                  </span>
                  <span className="priority-select__option-label">
                    {priority.label}
                  </span>
                </div>
                {isSelected && (
                  <FiCheck
                    className="priority-select__check"
                    style={{ color: priority.textColor }}
                    size={16}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PrioritySelect;
