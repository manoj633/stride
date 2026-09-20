import React, { useEffect, useRef } from "react";
import { FiAlertTriangle, FiInfo } from "react-icons/fi";
import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Auto-focus confirm button on open
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-modal-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className={`confirm-modal ${isDanger ? "confirm-modal--danger" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-modal__header">
          <div
            className={`confirm-modal__icon-wrap ${
              isDanger
                ? "confirm-modal__icon-wrap--danger"
                : "confirm-modal__icon-wrap--info"
            }`}
          >
            {isDanger ? <FiAlertTriangle /> : <FiInfo />}
          </div>
          <div className="confirm-modal__header-text">
            <h3 id="confirm-modal-title" className="confirm-modal__title">
              {title}
            </h3>
            <p className="confirm-modal__message">{message}</p>
          </div>
        </div>

        <div className="confirm-modal__footer">
          <button
            type="button"
            className="confirm-modal__btn confirm-modal__btn--cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            className={`confirm-modal__btn ${
              isDanger
                ? "confirm-modal__btn--danger"
                : "confirm-modal__btn--primary"
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
