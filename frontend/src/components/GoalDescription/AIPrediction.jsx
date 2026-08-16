import React, { useEffect, useState } from "react";
import { goalAPI } from "../../services/api/urlService";
import "./AIPrediction.css";

const AIPrediction = ({ goalId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchPrediction = async () => {
      try {
        setLoading(true);
        const { data } = await goalAPI.getGoalPrediction(goalId);
        if (active) {
          setPrediction(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error("Error fetching goal prediction:", err);
          setError("Could not load AI prediction metrics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (goalId) {
      fetchPrediction();
    }

    return () => {
      active = false;
    };
  }, [goalId]);

  if (loading) {
    return (
      <div className="ai-prediction loading">
        <div className="ai-prediction__pulse"></div>
        <span>AI Coach analyzing your completion rate...</span>
      </div>
    );
  }

  if (error || !prediction) {
    return null; // Silent fail or fallback
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="ai-badge completed">Completed 🏆</span>;
      case "on-track":
        return <span className="ai-badge on-track">On Track 🚀</span>;
      case "at-risk":
        return <span className="ai-badge at-risk">At Risk ⚠️</span>;
      case "overdue":
        return <span className="ai-badge overdue">Overdue 🚨</span>;
      default:
        return <span className="ai-badge neutral">Needs Tasks 📊</span>;
    }
  };

  return (
    <div className="ai-prediction">
      <div className="ai-prediction__header">
        <div className="ai-prediction__title-group">
          <span className="ai-prediction__icon">🧠</span>
          <h3>AI Coach Forecast</h3>
        </div>
        {getStatusBadge(prediction.status)}
      </div>

      <div className="ai-prediction__assessment">
        <p>{prediction.aiCoachAssessment}</p>
      </div>

      {prediction.status !== "neutral" && prediction.status !== "completed" && (
        <div className="ai-prediction__metrics">
          <div className="prediction-metric">
            <span className="prediction-metric__value">
              {prediction.completionVelocity ? prediction.completionVelocity.toFixed(1) : "0.0"}
            </span>
            <span className="prediction-metric__label">Tasks/Day Speed</span>
          </div>
          <div className="prediction-metric">
            <span className="prediction-metric__value">{prediction.daysRemaining}</span>
            <span className="prediction-metric__label">Days Left</span>
          </div>
          <div className="prediction-metric">
            <span className="prediction-metric__value">
              {prediction.daysNeeded ? Math.ceil(prediction.daysNeeded) : "—"}
            </span>
            <span className="prediction-metric__label">Days Needed</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPrediction;
