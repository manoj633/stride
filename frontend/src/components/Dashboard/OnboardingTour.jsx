import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTarget, FiCheckSquare, FiClock, FiActivity, FiX, FiTag } from "react-icons/fi";
import "./OnboardingTour.css";

const OnboardingTour = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Stride! 👋",
      description: "Stride is a premium, developer-oriented productivity dashboard. It helps you manage your vision, structure your progress, and stay focused on what matters.",
      icon: <FiActivity size={48} className="tour-icon text-accent" />,
      colorClass: "slide-welcome"
    },
    {
      title: "Set Visionary Goals 🚀",
      description: "Stride is built on a clear structural hierarchy. Think of an Annual Goal as a whole book you want to read. Set your broad vision and prioritize it dynamically.",
      icon: <FiTarget size={48} className="tour-icon text-goal" />,
      colorClass: "slide-goals"
    },
    {
      title: "Divide into Tasks & Subtasks 📋",
      description: "Break your Goal (the book) down into Tasks (like chapters), and split those into Subtasks (like reading individual sections or pages) to track day-to-day progress.",
      icon: <FiCheckSquare size={48} className="tour-icon text-task" />,
      colorClass: "slide-tasks"
    },
    {
      title: "Organize with Tags 🏷️",
      description: "Create and apply color-coded Tags to label, categorize, and filter your goals and tasks across your entire workspace, making them effortless to search and track.",
      icon: <FiTag size={48} className="tour-icon text-tag" />,
      colorClass: "slide-tags"
    },
    {
      title: "Maintain Focus (Pomodoro) ⏱️",
      description: "Leverage the built-in Pomodoro timer to manage deep-work blocks. Align timing with your schedule, and stay productive without burning out.",
      icon: <FiClock size={48} className="tour-icon text-timer" />,
      colorClass: "slide-timer"
    }
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("onboardingDismissed", "true");
    onClose();
  };

  const current = slides[currentSlide];

  return (
    <AnimatePresence>
      <div className="tour-overlay">
        <motion.div 
          className="tour-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleFinish}
        />
        <motion.div 
          className="tour-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <button className="tour-close-btn" onClick={handleFinish} aria-label="Close tour">
            <FiX size={20} />
          </button>

          <div className="tour-content-wrapper">
            <div className={`tour-graphic-container ${current.colorClass}`}>
              <motion.div
                key={currentSlide}
                initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="tour-icon-wrapper"
              >
                {current.icon}
              </motion.div>
            </div>

            <div className="tour-body">
              <motion.h2 
                key={`title-${currentSlide}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="tour-title"
              >
                {current.title}
              </motion.h2>
              <motion.p 
                key={`desc-${currentSlide}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="tour-desc"
              >
                {current.description}
              </motion.p>
            </div>
          </div>

          <div className="tour-footer">
            <div className="tour-dots">
              {slides.map((_, index) => (
                <div 
                  key={index} 
                  className={`tour-dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>

            <div className="tour-actions">
              {currentSlide > 0 && (
                <button className="tour-action-btn secondary" onClick={handlePrev}>
                  Back
                </button>
              )}
              <button className="tour-action-btn primary" onClick={handleNext}>
                {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
