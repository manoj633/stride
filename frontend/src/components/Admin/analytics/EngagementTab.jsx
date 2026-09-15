import React, { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiRefreshCw,
  FiActivity,
  FiZap,
} from "react-icons/fi";
import { adminAnalyticsAPI } from "../../../services/api/urlService";
import LoadingSpinner from "../../Common/LoadingSpinner";

const EngagementTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAnalyticsAPI.getEngagement();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load engagement analytics:", err);
      setError("Failed to load engagement metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating engagement & retention metrics..." />;
  }

  if (error || !data) {
    return (
      <div className="admin-error-container">
        <p>{error || "No analytics data available"}</p>
        <button className="admin-btn admin-btn--primary" onClick={fetchData}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  const { overview, activityTrend, streakBuckets, levelDistribution, xpDistribution, signupCohorts } =
    data;

  // Compute maximum completions for scaling the bar chart
  const maxCompletions = Math.max(...activityTrend.map((d) => d.completions), 1);

  return (
    <div className="analytics-tab-content">
      {/* Header with refresh button */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Engagement & Retention</h2>
          <p className="analytics-subtitle">
            Deriving DAU/WAU, activity stickiness, signup cohorts, and gamification distributions from live user events.
          </p>
        </div>
        <button className="admin-btn admin-btn--secondary" onClick={fetchData} title="Refresh engagement data">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card analytics-kpi-card--dau">
          <div className="analytics-kpi-icon">
            <FiUsers />
          </div>
          <div className="analytics-kpi-body">
            <span className="analytics-kpi-label">Daily Active Users (DAU)</span>
            <div className="analytics-kpi-value-row">
              <span className="analytics-kpi-value">{overview.dau.toLocaleString()}</span>
              <span className="analytics-kpi-subtext">Last 24 hours</span>
            </div>
            <span className="analytics-kpi-hint">Users active or completing tasks today</span>
          </div>
        </div>

        <div className="analytics-kpi-card analytics-kpi-card--wau">
          <div className="analytics-kpi-icon">
            <FiActivity />
          </div>
          <div className="analytics-kpi-body">
            <span className="analytics-kpi-label">Weekly Active Users (WAU)</span>
            <div className="analytics-kpi-value-row">
              <span className="analytics-kpi-value">{overview.wau.toLocaleString()}</span>
              <span className="analytics-kpi-subtext">Last 7 days</span>
            </div>
            <span className="analytics-kpi-hint">MAU: {overview.mau.toLocaleString()} in last 30d</span>
          </div>
        </div>

        <div className="analytics-kpi-card analytics-kpi-card--stickiness">
          <div className="analytics-kpi-icon">
            <FiTrendingUp />
          </div>
          <div className="analytics-kpi-body">
            <span className="analytics-kpi-label">Product Stickiness (DAU/WAU)</span>
            <div className="analytics-kpi-value-row">
              <span className="analytics-kpi-value">{overview.stickiness}%</span>
              <span
                className={`analytics-status-pill ${
                  overview.stickiness >= 20
                    ? "analytics-status-pill--success"
                    : overview.stickiness >= 10
                    ? "analytics-status-pill--warning"
                    : "analytics-status-pill--neutral"
                }`}
              >
                {overview.stickiness >= 20 ? "Strong" : overview.stickiness >= 10 ? "Moderate" : "Low"}
              </span>
            </div>
            <span className="analytics-kpi-hint">Benchmark: 20%+ is industry top-quartile</span>
          </div>
        </div>

        <div className="analytics-kpi-card analytics-kpi-card--streak">
          <div className="analytics-kpi-icon">
            <FiZap />
          </div>
          <div className="analytics-kpi-body">
            <span className="analytics-kpi-label">Streak Dynamics</span>
            <div className="analytics-kpi-value-row">
              <span className="analytics-kpi-value">{overview.maxStreak}d</span>
              <span className="analytics-kpi-subtext">Avg: {overview.avgStreak}d</span>
            </div>
            <span className="analytics-kpi-hint">Current all-time high user streak</span>
          </div>
        </div>
      </div>

      {/* 14-Day Activity Sparkline / Bar Chart */}
      <div className="analytics-panel">
        <div className="analytics-panel__header">
          <div>
            <h3 className="analytics-panel__title">14-Day Task Completion & Activity Trend</h3>
            <p className="analytics-panel__subtitle">Daily completed tasks and active distinct task completers</p>
          </div>
        </div>

        <div className="analytics-barchart-container">
          <div className="analytics-barchart">
            {activityTrend.map((day, idx) => {
              const heightPercent = Math.max(Math.round((day.completions / maxCompletions) * 100), 6);
              return (
                <div key={day.date} className="analytics-barchart__col">
                  <div className="analytics-barchart__bar-wrapper" title={`${day.date}: ${day.completions} tasks (${day.activeUsers} users)`}>
                    <span className="analytics-barchart__tooltip">
                      <strong>{day.completions} tasks</strong>
                      <small>{day.activeUsers} active users</small>
                    </span>
                    <div
                      className="analytics-barchart__bar"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="analytics-barchart__label">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Signup Cohorts Retention Matrix */}
      <div className="analytics-panel">
        <div className="analytics-panel__header">
          <div>
            <h3 className="analytics-panel__title">Signup Cohort Retention</h3>
            <p className="analytics-panel__subtitle">
              Weekly signup cohorts tracked by subsequent activity intervals and active retention
            </p>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Signup Cohort</th>
                <th>Cohort Size</th>
                <th>Active in Week 1</th>
                <th>Active in Week 2</th>
                <th>Currently Active (7d)</th>
                <th>Retention Rate</th>
              </tr>
            </thead>
            <tbody>
              {signupCohorts.map((cohort, idx) => (
                <tr key={cohort.cohort}>
                  <td className="admin-table__primary-cell">
                    <strong>{cohort.cohort}</strong>
                  </td>
                  <td>
                    <span className="analytics-badge analytics-badge--neutral">{cohort.size} users</span>
                  </td>
                  <td>
                    {cohort.size > 0 ? (
                      <span>
                        {cohort.retainedWeek1} ({Math.round((cohort.retainedWeek1 / cohort.size) * 100)}%)
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {cohort.size > 0 ? (
                      <span>
                        {cohort.retainedWeek2} ({Math.round((cohort.retainedWeek2 / cohort.size) * 100)}%)
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {cohort.size > 0 ? (
                      <strong>{cohort.currentlyActive}</strong>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {cohort.size > 0 ? (
                      <div className="analytics-retention-cell">
                        <div className="analytics-mini-progress">
                          <div
                            className="analytics-mini-progress__bar"
                            style={{ width: `${Math.min(cohort.retentionRate, 100)}%` }}
                          />
                        </div>
                        <span
                          className={`analytics-status-pill ${
                            cohort.retentionRate >= 50
                              ? "analytics-status-pill--success"
                              : cohort.retentionRate >= 20
                              ? "analytics-status-pill--warning"
                              : "analytics-status-pill--neutral"
                          }`}
                        >
                          {cohort.retentionRate}%
                        </span>
                      </div>
                    ) : (
                      <span className="analytics-text-muted">No signups</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Grid: Streak & Gamification */}
      <div className="analytics-grid-2col">
        {/* Streak Distribution */}
        <div className="analytics-panel">
          <div className="analytics-panel__header">
            <div>
              <h3 className="analytics-panel__title">Streak Distribution</h3>
              <p className="analytics-panel__subtitle">Count of users per daily activity streak bracket</p>
            </div>
          </div>

          <div className="analytics-distribution-list">
            {streakBuckets.map((bucket) => {
              const maxBucketCount = Math.max(...streakBuckets.map((b) => b.count), 1);
              const percent = Math.round((bucket.count / maxBucketCount) * 100);
              return (
                <div key={bucket.bucket} className="analytics-dist-item">
                  <div className="analytics-dist-item__header">
                    <span className="analytics-dist-item__label">{bucket.bucket}</span>
                    <span className="analytics-dist-item__value">{bucket.count} users</span>
                  </div>
                  <div className="analytics-progress-track">
                    <div
                      className="analytics-progress-fill analytics-progress-fill--orange"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level & XP Distribution */}
        <div className="analytics-panel">
          <div className="analytics-panel__header">
            <div>
              <h3 className="analytics-panel__title">Level & XP Distribution</h3>
              <p className="analytics-panel__subtitle">Progression tiers across the registered user base</p>
            </div>
          </div>

          <div className="analytics-distribution-list">
            <h4 className="analytics-subheading">User Levels</h4>
            {levelDistribution.map((tier) => {
              const maxCount = Math.max(...levelDistribution.map((t) => t.count), 1);
              const percent = Math.round((tier.count / maxCount) * 100);
              return (
                <div key={tier.tier} className="analytics-dist-item">
                  <div className="analytics-dist-item__header">
                    <span className="analytics-dist-item__label">{tier.tier}</span>
                    <span className="analytics-dist-item__value">{tier.count} users</span>
                  </div>
                  <div className="analytics-progress-track">
                    <div
                      className="analytics-progress-fill analytics-progress-fill--purple"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <h4 className="analytics-subheading" style={{ marginTop: "18px" }}>XP Brackets</h4>
            {xpDistribution.map((xp) => {
              const maxCount = Math.max(...xpDistribution.map((t) => t.count), 1);
              const percent = Math.round((xp.count / maxCount) * 100);
              return (
                <div key={xp.tier} className="analytics-dist-item">
                  <div className="analytics-dist-item__header">
                    <span className="analytics-dist-item__label">{xp.tier}</span>
                    <span className="analytics-dist-item__value">{xp.count} users</span>
                  </div>
                  <div className="analytics-progress-track">
                    <div
                      className="analytics-progress-fill analytics-progress-fill--blue"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementTab;
