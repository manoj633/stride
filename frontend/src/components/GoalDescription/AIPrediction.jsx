import React, { useEffect, useState } from "react";
import { goalAPI } from "../../services/api/urlService";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import "./AIPrediction.css";

const AIPrediction = ({ goalId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await goalAPI.getGoalPrediction(goalId, {
        refresh: forceRefresh,
      });

      setPrediction(data);
      setError(null);

      if (forceRefresh) {
        toast.success("AI Coach prediction updated!");
      }
    } catch (err) {
      console.error("Error fetching goal prediction:", err);
      if (forceRefresh) {
        toast.error("Failed to refresh prediction. Showing cached assessment.");
      } else {
        setError("Could not load AI prediction metrics.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (goalId) {
      fetchPrediction(false);
    }
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

  const formatCachedTime = (cachedAt) => {
    if (!cachedAt) return null;
    const date = new Date(cachedAt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="ai-prediction">
      <div className="ai-prediction__header">
        <div className="ai-prediction__title-group">
          <span className="ai-prediction__icon">🧠</span>
          <div>
            <h3>AI Coach Forecast</h3>
            {prediction.cachedAt && (
              <span className="ai-prediction__timestamp">
                {prediction.isCached ? "Cached assessment" : "Freshly generated"} • {formatCachedTime(prediction.cachedAt)}
              </span>
            )}
          </div>
        </div>

        <div className="ai-prediction__actions">
          <button
            type="button"
            className={`ai-prediction__refresh-btn ${refreshing ? "refreshing" : ""}`}
            onClick={() => fetchPrediction(true)}
            disabled={refreshing || loading}
            title="Generate fresh AI prediction with latest task metrics"
            aria-label="Refresh AI prediction"
          >
            <FiRefreshCw className={`refresh-icon ${refreshing ? "spinning" : ""}`} size={12} />
            <span>{refreshing ? "Analyzing..." : "Refresh"}</span>
          </button>
          {getStatusBadge(prediction.status)}
        </div>
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
