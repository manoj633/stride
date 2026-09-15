import React, { useState, useEffect } from "react";
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiSlash,
  FiKey,
  FiMail,
  FiActivity,
  FiSearch,
} from "react-icons/fi";
import { adminAnalyticsAPI } from "../../../services/api/urlService";
import LoadingSpinner from "../../Common/LoadingSpinner";

const SecurityHealthTab = () => {
  const [securityData, setSecurityData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rateLimitFilter, setRateLimitFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [secRes, healthRes] = await Promise.all([
        adminAnalyticsAPI.getSecurity(),
        adminAnalyticsAPI.getSystemHealth(),
      ]);
      setSecurityData(secRes.data);
      setHealthData(healthRes.data);
    } catch (err) {
      console.error("Failed to load security and health analytics:", err);
      setError("Failed to load security & health telemetry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Scanning abuse telemetry and system health..." />;
  }

  if (error || !securityData || !healthData) {
    return (
      <div className="admin-error-container">
        <p>{error || "No security telemetry available"}</p>
        <button className="admin-btn admin-btn--primary" onClick={fetchData}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  const { metrics: secMetrics, limiterBreakdown, topOffendingIPs, topTargetedEmails, recentBreaches } =
    securityData;
  const { systemStatus, metrics: healthMetrics, componentBreakdown, recentErrors } =
    healthData;

  const filteredBreaches =
    rateLimitFilter === "all"
      ? recentBreaches
      : recentBreaches.filter((b) => b.limiter === rateLimitFilter);

  return (
    <div className="analytics-tab-content">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Security & System Health</h2>
          <p className="analytics-subtitle">
            Observing rate-limit trigger abuse (loginLimiter / passwordResetLimiter) and tracking system-level delivery failures.
          </p>
        </div>
        <button className="admin-btn admin-btn--secondary" onClick={fetchData} title="Refresh security & health telemetry">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* SECTION 1: SYSTEM HEALTH OVERVIEW */}
      <div className={`analytics-health-banner analytics-health-banner--${systemStatus}`}>
        <div className="analytics-health-banner__icon">
          {systemStatus === "healthy" ? (
            <FiCheckCircle />
          ) : (
            <FiAlertTriangle />
          )}
        </div>
        <div className="analytics-health-banner__content">
          <div className="analytics-health-banner__title-row">
            <h3 className="analytics-health-banner__title">
              System Health Status: {systemStatus.toUpperCase()}
            </h3>
            <span
              className={`analytics-status-pill ${
                systemStatus === "healthy"
                  ? "analytics-status-pill--success"
                  : systemStatus === "degraded"
                  ? "analytics-status-pill--warning"
                  : "analytics-status-pill--danger"
              }`}
            >
              {systemStatus === "healthy"
                ? "All Systems Operational"
                : systemStatus === "degraded"
                ? "Minor Incidents in 24h"
                : "Active Incidents Detected"}
            </span>
          </div>
          <p className="analytics-health-banner__desc">
            {systemStatus === "healthy"
              ? "Weekly report background jobs and transactional notifications are executing normally without recorded delivery failures."
              : "Some delivery failures or generation errors have been caught and recorded. Review the error feed below."}
          </p>
        </div>
      </div>

      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon analytics-kpi-icon--teal">
            <FiActivity />
          </div>
          <div className="analytics-kpi-body">
            <span className="analytics-kpi-label">Health Incidents (24h)</span>
            <div className="analytics-kpi-value-row">
              <span className="analytics-kpi-value">{healthMetrics.errors24h}</span>
              <span className="analytics-kpi-subtext">7d: {healthMetrics.errors7d}</span>
            </div>
            <span className="analytics-kpi-hint">Total all-time incidents: {healthMetrics.totalErrorsAllTime}</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon analytics-kpi-icon--blue">
            <FiMail />
          </div>
          <div className="analytics-kpi-body">
            <span className="analytics-kpi-label">Weekly Reports Generated</span>
            <div className="analytics-kpi-value-row">
              <span className="analytics-kpi-value">{healthMetrics.totalWeeklyReportsSent.toLocaleString()}</span>
            </div>
            <span className="analytics-kpi-hint">Archived weekly report snapshots</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon analytics-kpi-icon--amber">
            <FiShield />
          </div>
          <div className="analytics-kpi-body">
            <span className="analytics-kpi-label">Rate Limit Blocks (24h)</span>
            <div className="analytics-kpi-value-row">
              <span className="analytics-kpi-value">{secMetrics.totalBlocks24h}</span>
              <span className="analytics-kpi-subtext">7d: {secMetrics.totalBlocks7d}</span>
            </div>
            <span className="analytics-kpi-hint">All-time blocked attempts: {secMetrics.totalBlocksAllTime}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: RATE LIMIT & ABUSE VISIBILITY */}
      <div className="analytics-panel">
        <div className="analytics-panel__header">
          <div>
            <h3 className="analytics-panel__title">Rate-Limit & Abuse Monitoring</h3>
            <p className="analytics-panel__subtitle">
              Live telemetry on who is hitting loginLimiter, passwordResetLimiter, and twoFactorLimiter
            </p>
          </div>
        </div>

        {/* Limiter Type Badges */}
        <div className="analytics-limiter-chips">
          <button
            className={`analytics-chip ${rateLimitFilter === "all" ? "analytics-chip--active" : ""}`}
            onClick={() => setRateLimitFilter("all")}
          >
            All Limiters ({secMetrics.totalBlocksAllTime})
          </button>
          {limiterBreakdown.map((lb) => (
            <button
              key={lb._id}
              className={`analytics-chip ${rateLimitFilter === lb._id ? "analytics-chip--active" : ""}`}
              onClick={() => setRateLimitFilter(lb._id)}
            >
              {lb._id}: <strong>{lb.count}</strong>
            </button>
          ))}
        </div>

        {/* Entities Grid: Top Targeted Emails & Top Offending IPs */}
        <div className="analytics-grid-2col">
          {/* Top Targeted Emails */}
          <div className="analytics-subpanel">
            <h4 className="analytics-subheading">Top Targeted User Accounts (Emails)</h4>
            {topTargetedEmails && topTargetedEmails.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Account Email</th>
                      <th>Blocks</th>
                      <th>Unique IPs</th>
                      <th>Last Blocked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTargetedEmails.map((item) => (
                      <tr key={item._id}>
                        <td className="admin-table__primary-cell">
                          <strong>{item._id}</strong>
                        </td>
                        <td>
                          <span className="analytics-badge analytics-badge--danger">{item.count}</span>
                        </td>
                        <td>{item.ips?.length || 1}</td>
                        <td className="admin-table__secondary-cell">
                          {new Date(item.lastBlocked).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="analytics-empty-hint">No accounts have been targeted by rate limiters yet.</p>
            )}
          </div>

          {/* Top Offending IPs */}
          <div className="analytics-subpanel">
            <h4 className="analytics-subheading">Top Offending IP Addresses</h4>
            {topOffendingIPs && topOffendingIPs.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>IP Address</th>
                      <th>Blocks</th>
                      <th>Targeted Emails</th>
                      <th>Last Blocked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topOffendingIPs.map((item) => (
                      <tr key={item._id}>
                        <td className="admin-table__primary-cell">
                          <code>{item._id}</code>
                        </td>
                        <td>
                          <span className="analytics-badge analytics-badge--warning">{item.count}</span>
                        </td>
                        <td>{item.targetedEmails?.filter(Boolean).length || 0}</td>
                        <td className="admin-table__secondary-cell">
                          {new Date(item.lastBlocked).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="analytics-empty-hint">No IP rate-limit violations recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Rate Limit Breaches Table */}
        <div className="analytics-subpanel" style={{ marginTop: "24px" }}>
          <h4 className="analytics-subheading">Recent Rate-Limit Violations Feed</h4>
          {filteredBreaches && filteredBreaches.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Limiter</th>
                    <th>Targeted Email</th>
                    <th>Origin IP</th>
                    <th>Endpoint</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBreaches.map((b) => (
                    <tr key={b._id}>
                      <td className="admin-table__secondary-cell">
                        {new Date(b.blockedAt || b.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span className="analytics-badge analytics-badge--warning">
                          {b.limiter}
                        </span>
                      </td>
                      <td className="admin-table__primary-cell">
                        {b.email ? <strong>{b.email}</strong> : <span className="analytics-text-muted">N/A</span>}
                      </td>
                      <td>
                        <code>{b.ip}</code>
                      </td>
                      <td>
                        <span className="analytics-endpoint-tag">{b.endpoint}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="analytics-empty-hint">
              {rateLimitFilter === "all"
                ? "No rate-limit violations recorded. The system is operating normally without abuse."
                : `No events recorded for ${rateLimitFilter}.`}
            </p>
          )}
        </div>
      </div>

      {/* SECTION 3: SYSTEM HEALTH INCIDENT FEED */}
      <div className="analytics-panel">
        <div className="analytics-panel__header">
          <div>
            <h3 className="analytics-panel__title">System Health & Failure Incident Feed</h3>
            <p className="analytics-panel__subtitle">
              Failed weekly-report generations, notification delivery failures, and runtime exceptions
            </p>
          </div>
        </div>

        {recentErrors && recentErrors.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Component</th>
                  <th>Status</th>
                  <th>Error Description</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {recentErrors.map((err) => (
                  <tr key={err._id}>
                    <td className="admin-table__secondary-cell">
                      {new Date(err.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="analytics-badge analytics-badge--neutral">
                        {err.component}
                      </span>
                    </td>
                    <td>
                      <span className="analytics-status-pill analytics-status-pill--danger">
                        {err.status}
                      </span>
                    </td>
                    <td className="admin-table__error-cell">
                      <code>{err.errorMessage}</code>
                    </td>
                    <td className="admin-table__secondary-cell">
                      {err.metadata?.recipientEmail ||
                        err.metadata?.userEmail ||
                        err.metadata?.scope ||
                        JSON.stringify(err.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="analytics-empty-state">
            <FiCheckCircle className="analytics-empty-icon" />
            <p className="analytics-empty-title">Zero Delivery or Report Generation Failures</p>
            <span className="analytics-empty-desc">
              All weekly reports and email notification dispatches have executed successfully.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityHealthTab;
