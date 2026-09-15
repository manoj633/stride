import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiClock,
  FiCpu,
  FiRefreshCw,
  FiTarget,
  FiCheckCircle,
  FiAlertTriangle,
  FiZap,
} from "react-icons/fi";
import { adminAnalyticsAPI } from "../../../services/api/urlService";
import LoadingSpinner from "../../Common/LoadingSpinner";

const FeatureUsageTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAnalyticsAPI.getFeatureUsage();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load feature usage analytics:", err);
      setError("Failed to load feature usage data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading feature adoption analytics..." />;
  }

  if (error || !data) {
    return (
      <div className="admin-error-container">
        <p>{error || "No feature adoption data available"}</p>
        <button className="admin-btn admin-btn--primary" onClick={fetchData}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  const { goalCollaboration, pomodoro, aiCoach } = data;

  return (
    <div className="analytics-tab-content">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Feature Adoption & Tooling</h2>
          <p className="analytics-subtitle">
            Measuring collaborative goal density, Pomodoro focus adoption, and live AI Productivity Coach usage.
          </p>
        </div>
        <button className="admin-btn admin-btn--secondary" onClick={fetchData} title="Refresh feature usage">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* SECTION 1: GOAL COLLABORATION */}
      <div className="analytics-panel">
        <div className="analytics-panel__header">
          <div>
            <h3 className="analytics-panel__title">Goal Collaboration Dynamics</h3>
            <p className="analytics-panel__subtitle">Solo goals vs shared multi-collaborator goals across the workspace</p>
          </div>
        </div>

        <div className="analytics-kpi-grid">
          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--blue">
              <FiTarget />
            </div>
            <div className="analytics-kpi-body">
              <span className="analytics-kpi-label">Solo Goals (0 Collaborators)</span>
              <div className="analytics-kpi-value-row">
                <span className="analytics-kpi-value">{goalCollaboration.soloGoals}</span>
                <span className="analytics-status-pill analytics-status-pill--neutral">
                  {goalCollaboration.soloPercentage}%
                </span>
              </div>
              <span className="analytics-kpi-hint">Individual contributor ownership</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--purple">
              <FiUsers />
            </div>
            <div className="analytics-kpi-body">
              <span className="analytics-kpi-label">Collaborative Goals (1+ Collaborators)</span>
              <div className="analytics-kpi-value-row">
                <span className="analytics-kpi-value">{goalCollaboration.collabGoals}</span>
                <span className="analytics-status-pill analytics-status-pill--success">
                  {goalCollaboration.collabPercentage}%
                </span>
              </div>
              <span className="analytics-kpi-hint">Team or pair goals</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--teal">
              <FiTarget />
            </div>
            <div className="analytics-kpi-body">
              <span className="analytics-kpi-label">Total Platform Goals</span>
              <div className="analytics-kpi-value-row">
                <span className="analytics-kpi-value">{goalCollaboration.totalGoals}</span>
              </div>
              <span className="analytics-kpi-hint">Across all active accounts</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar Breakdown */}
        <div className="analytics-collab-progress-section">
          <div className="analytics-collab-progress-header">
            <span>Solo Goals ({goalCollaboration.soloPercentage}%)</span>
            <span>Collaborative Goals ({goalCollaboration.collabPercentage}%)</span>
          </div>
          <div className="analytics-collab-progress-bar">
            <div
              className="analytics-collab-progress-segment analytics-collab-progress-segment--solo"
              style={{ width: `${goalCollaboration.soloPercentage}%` }}
              title={`Solo: ${goalCollaboration.soloGoals}`}
            />
            <div
              className="analytics-collab-progress-segment analytics-collab-progress-segment--collab"
              style={{ width: `${goalCollaboration.collabPercentage}%` }}
              title={`Collaborative: ${goalCollaboration.collabGoals}`}
            />
          </div>

          <div className="analytics-collab-distribution">
            {goalCollaboration.collabBuckets.map((bucket) => (
              <div key={bucket.label} className="analytics-collab-badge">
                <span className="analytics-collab-badge__count">{bucket.count}</span>
                <span className="analytics-collab-badge__label">{bucket.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: POMODORO ADOPTION */}
      <div className="analytics-panel">
        <div className="analytics-panel__header">
          <div>
            <h3 className="analytics-panel__title">Pomodoro Focus Adoption</h3>
            <p className="analytics-panel__subtitle">
              Adoption metrics, total focus intervals completed, and top power users
            </p>
          </div>
        </div>

        <div className="analytics-kpi-grid">
          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--orange">
              <FiClock />
            </div>
            <div className="analytics-kpi-body">
              <span className="analytics-kpi-label">Pomodoro Adoption Rate</span>
              <div className="analytics-kpi-value-row">
                <span className="analytics-kpi-value">{pomodoro.pomodoroAdoptionRate}%</span>
                <span className="analytics-status-pill analytics-status-pill--success">
                  {pomodoro.pomodoroUsers} / {pomodoro.totalUsers} users
                </span>
              </div>
              <span className="analytics-kpi-hint">Users who completed at least 1 session</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--orange">
              <FiZap />
            </div>
            <div className="analytics-kpi-body">
              <span className="analytics-kpi-label">Total Focus Sessions Completed</span>
              <div className="analytics-kpi-value-row">
                <span className="analytics-kpi-value">{pomodoro.totalPomodoroSessions.toLocaleString()}</span>
              </div>
              <span className="analytics-kpi-hint">~{Math.round((pomodoro.totalPomodoroSessions * 25) / 60)} estimated focus hours</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--orange">
              <FiZap />
            </div>
            <div className="analytics-kpi-body">
              <span className="analytics-kpi-label">Avg Sessions per Adopter</span>
              <div className="analytics-kpi-value-row">
                <span className="analytics-kpi-value">{pomodoro.avgPomodoroSessions}</span>
                <span className="analytics-kpi-subtext">sessions</span>
              </div>
              <span className="analytics-kpi-hint">Mean sessions for engaged users</span>
            </div>
          </div>
        </div>

        {/* Top Focus Users Leaderboard */}
        <div className="analytics-subpanel">
          <h4 className="analytics-subheading">Focus Leaderboard (Top Pomodoro Completers)</h4>
          {pomodoro.topPomodoroUsers && pomodoro.topPomodoroUsers.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Focus Sessions</th>
                    <th>Current Streak</th>
                    <th>Level & XP</th>
                  </tr>
                </thead>
                <tbody>
                  {pomodoro.topPomodoroUsers.map((u, i) => (
                    <tr key={u._id}>
                      <td className="admin-table__primary-cell">
                        <span className="analytics-rank-badge">#{i + 1}</span>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <strong style={{ color: "var(--accent-orange, #f97316)" }}>
                          {u.totalPomodorosCompleted}
                        </strong>{" "}
                        sessions
                      </td>
                      <td>{u.streak || 0} days</td>
                      <td>
                        <span className="analytics-badge analytics-badge--purple">
                          Lvl {u.level || 1} • {u.xp || 0} XP
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="analytics-empty-hint">No Pomodoro focus sessions recorded yet.</p>
          )}
        </div>
      </div>

      {/* SECTION 3: AI COACH (GEMINI) USAGE & LOGS */}
      <div className="analytics-panel">
        <div className="analytics-panel__header">
          <div>
            <h3 className="analytics-panel__title">AI Productivity Coach (Gemini Integration)</h3>
            <p className="analytics-panel__subtitle">
              Logging API calls, latency, fallback heuristics, and unique user queries
            </p>
          </div>
        </div>

        <div className="analytics-kpi-grid">
          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--purple">
              <FiCpu />
            </div>
            <div className="analytics-kpi-body">
              <span className="analytics-kpi-label">Total AI Coach Invocations</span>
              <div className="analytics-kpi-value-row">
                <span className="analytics-kpi-value">{aiCoach.totalAiCalls.toLocaleString()}</span>
              </div>
              <span className="analytics-kpi-hint">Velocity & coaching predictions</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--teal">
              <FiCheckCircle />
            </div>
            <div className="analytics-kpi-body">
              <span className="analytics-kpi-label">Gemini API Successes</span>
              <div className="analytics-kpi-value-row">
                <span className="analytics-kpi-value">{aiCoach.successfulAiCalls.toLocaleString()}</span>
                <span className="analytics-status-pill analytics-status-pill--success">
                  {aiCoach.totalAiCalls > 0
                    ? Math.round((aiCoach.successfulAiCalls / aiCoach.totalAiCalls) * 100)
                    : 0}
                  %
                </span>
              </div>
              <span className="analytics-kpi-hint">Live Gemini 2.5 Flash model</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--amber">
              <FiAlertTriangle />
            </div>
            <div className="analytics-kpi-body">
              <span className="analytics-kpi-label">Fallbacks & Errors</span>
              <div className="analytics-kpi-value-row">
                <span className="analytics-kpi-value">
                  {(aiCoach.fallbackAiCalls + aiCoach.errorAiCalls).toLocaleString()}
                </span>
                {aiCoach.errorAiCalls > 0 && (
                  <span className="analytics-status-pill analytics-status-pill--danger">
                    {aiCoach.errorAiCalls} errors
                  </span>
                )}
              </div>
              <span className="analytics-kpi-hint">
                No Key: {aiCoach.simulatedFallbackCalls || 0} • Gemini Fallback/Errors:{" "}
                {(aiCoach.geminiFallbackCalls || 0) + (aiCoach.errorAiCalls || 0)}
              </span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="analytics-kpi-icon analytics-kpi-icon--blue">
              <FiUsers />
            </div>
            <div className="analytics-kpi-body">
              <span className="analytics-kpi-label">Unique Users & Latency</span>
              <div className="analytics-kpi-value-row">
                <span className="analytics-kpi-value">{aiCoach.uniqueUsersCount} users</span>
                <span className="analytics-kpi-subtext">{aiCoach.avgAiLatencyMs}ms avg</span>
              </div>
              <span className="analytics-kpi-hint">Average round-trip response time</span>
            </div>
          </div>
        </div>

        {/* Recent AI Coach Calls Log Table */}
        <div className="analytics-subpanel">
          <h4 className="analytics-subheading">Recent AI Coach Invocations</h4>
          {aiCoach.recentLogs && aiCoach.recentLogs.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Goal Context</th>
                    <th>Model</th>
                    <th>Latency</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {aiCoach.recentLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="admin-table__secondary-cell">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="admin-table__primary-cell">
                        {log.userId ? log.userId.name : "Anonymous"}
                      </td>
                      <td>{log.goalId?.title || log.promptPreview || "-"}</td>
                      <td>
                        <span className="analytics-badge analytics-badge--neutral">{log.model}</span>
                      </td>
                      <td>{log.latencyMs} ms</td>
                      <td>
                        <span
                          className={`analytics-status-pill ${
                            log.status === "success"
                              ? "analytics-status-pill--success"
                              : log.status === "fallback_simulated"
                              ? "analytics-status-pill--warning"
                              : "analytics-status-pill--danger"
                          }`}
                        >
                          {log.status === "success"
                            ? "Gemini Live"
                            : log.status === "fallback_simulated"
                            ? "Simulated Fallback"
                            : "Error"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="analytics-empty-hint">
              No AI Coach requests logged yet. As users view goal velocity and predictive coaching, requests will be logged here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureUsageTab;
