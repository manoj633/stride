import React, { useState, useEffect } from "react";
import {
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiShare2,
  FiTrendingUp,
  FiZap,
  FiInfo,
  FiArrowUpRight,
  FiTarget,
  FiList,
  FiChevronDown,
} from "react-icons/fi";
import { userAPI } from "../../services/api/urlService";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import { toast } from "react-toastify";
import "./YearInReview.css";

const YearInReview = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchReview = async (year) => {
    try {
      setLoading(true);
      setError(null);
      const res = await userAPI.getYearInReview({ year });
      setData(res.data);
      if (res.data.year) {
        setSelectedYear(res.data.year);
      }
    } catch (err) {
      console.error("Failed to load Year in Review:", err);
      setError(err?.response?.data?.message || "Failed to load Year in Review");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview(selectedYear);
  }, [selectedYear]);

  const handleCopySummary = () => {
    if (!data) return;

    const summaryText = `🌟 My Stride ${data.year} Year in Review 🌟
${data.archetype?.badge || "🏆"} Archetype: ${data.archetype?.title || "Productive Achiever"}
🎯 Goals Completed: ${data.metrics.goals.completed}/${data.metrics.goals.total} (${data.metrics.goals.rate}%)
✅ Tasks Completed: ${data.metrics.tasks.completed} (${data.metrics.tasks.subtasksCompleted} subtasks)
⏱️ Focus Sessions: ${data.metrics.focus.sessions} (${data.metrics.focus.focusHours} hrs)
⚡ Estimated Activity XP: +${data.metrics.xp.estimatedActivityXp.toLocaleString()} XP
🏅 Peak Productivity Month: ${data.peakMonth?.month || "N/A"} (${data.peakMonth?.completions || 0} tasks)
🚀 Tracked with Stride Enterprise Productivity`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      toast.success("Retrospective summary copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    });
  };

  if (loading && !data) {
    return (
      <div className="yir-loading-container">
        <LoadingSpinner message={`Generating your ${selectedYear} Year in Review...`} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="yir-container">
        <ErrorMessage message={error} />
        <button
          className="yir-btn yir-btn--primary"
          onClick={() => fetchReview(selectedYear)}
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    year,
    availableYears = [currentYear],
    user,
    archetype,
    metrics,
    monthlyTrend = [],
    peakMonth,
    categories = [],
    priorityBreakdown = {},
    standoutGoals = [],
    achievements = [],
  } = data;

  const maxCompletions = Math.max(...monthlyTrend.map((m) => m.completions), 1);

  return (
    <div className="yir-page">
      <div className="yir-container">
        {/* Top Navigation & Controls */}
        <header className="yir-header">
          <div className="yir-header__text">
            <div className="yir-header__badge-row">
              <span className="yir-tag">
                <FiAward /> Annual Retrospective
              </span>
              <span className="yir-year-badge">{year}</span>
            </div>
            <h1 className="yir-title">Year in Review</h1>
            <p className="yir-subtitle">
              A comprehensive retrospective of your execution, focus sessions, and accomplishments.
            </p>
          </div>

          <div className="yir-controls">
            {/* Year Selector */}
            <div className="yir-year-select-wrap">
              <FiCalendar className="yir-select-icon" />
              <select
                className="yir-year-select"
                value={year}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                aria-label="Select retrospective year"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} Retrospective
                  </option>
                ))}
              </select>
              <FiChevronDown className="yir-select-chevron" />
            </div>

            {/* Share / Copy Summary Button */}
            <button
              className={`yir-btn ${copied ? "yir-btn--copied" : "yir-btn--primary"}`}
              onClick={handleCopySummary}
              title="Copy formatted summary to clipboard"
            >
              <FiShare2 /> {copied ? "Copied!" : "Share Summary"}
            </button>
          </div>
        </header>

        {/* Hero Archetype Banner */}
        <section className="yir-hero-card">
          <div className="yir-hero-card__glow"></div>
          <div className="yir-hero-card__content">
            <div className="yir-hero-card__badge-icon" role="img" aria-label="Archetype badge">
              {archetype?.badge || "🏆"}
            </div>
            <div className="yir-hero-card__meta">
              <span className="yir-hero-card__kicker">Your {year} Productivity Persona</span>
              <h2 className="yir-hero-card__archetype">{archetype?.title || "Consistent Builder"}</h2>
              <p className="yir-hero-card__tagline">{archetype?.tagline}</p>
            </div>
            <div className="yir-hero-card__stats">
              <div className="yir-hero-pill">
                <span className="yir-hero-pill__lbl">Current Level</span>
                <span className="yir-hero-pill__val">Level {user?.level || 1}</span>
              </div>
              <div className="yir-hero-pill">
                <span className="yir-hero-pill__lbl">Active Streak</span>
                <span className="yir-hero-pill__val">{user?.streak || 0} Days 🔥</span>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Metric KPI Cards */}
        <section className="yir-kpi-grid">
          {/* Goals Card */}
          <div className="yir-kpi-card yir-kpi-card--goals">
            <div className="yir-kpi-card__header">
              <div className="yir-kpi-card__icon">
                <FiTarget />
              </div>
              <span className="yir-kpi-card__pill">{metrics.goals.rate}% Rate</span>
            </div>
            <div className="yir-kpi-card__body">
              <span className="yir-kpi-card__label">Goals Completed</span>
              <div className="yir-kpi-card__value-row">
                <span className="yir-kpi-card__value">{metrics.goals.completed}</span>
                <span className="yir-kpi-card__subvalue">of {metrics.goals.total} active</span>
              </div>
              <div className="yir-progress-track">
                <div
                  className="yir-progress-fill yir-progress-fill--blue"
                  style={{ width: `${Math.min(metrics.goals.rate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="yir-kpi-card yir-kpi-card--tasks">
            <div className="yir-kpi-card__header">
              <div className="yir-kpi-card__icon">
                <FiCheckCircle />
              </div>
              <span className="yir-kpi-card__pill">{metrics.tasks.rate}% Completed</span>
            </div>
            <div className="yir-kpi-card__body">
              <span className="yir-kpi-card__label">Tasks Finished</span>
              <div className="yir-kpi-card__value-row">
                <span className="yir-kpi-card__value">{metrics.tasks.completed}</span>
                <span className="yir-kpi-card__subvalue">
                  +{metrics.tasks.subtasksCompleted} subtasks
                </span>
              </div>
              <div className="yir-progress-track">
                <div
                  className="yir-progress-fill yir-progress-fill--green"
                  style={{ width: `${Math.min(metrics.tasks.rate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Focus Sessions Card with Cutover Awareness */}
          <div className="yir-kpi-card yir-kpi-card--focus">
            <div className="yir-kpi-card__header">
              <div className="yir-kpi-card__icon">
                <FiClock />
              </div>
              <span className="yir-kpi-card__pill">{metrics.focus.focusHours}h Focus</span>
            </div>
            <div className="yir-kpi-card__body">
              <span className="yir-kpi-card__label">Pomodoro Sessions</span>
              <div className="yir-kpi-card__value-row">
                <span className="yir-kpi-card__value">{metrics.focus.sessions}</span>
                <span className="yir-kpi-card__subvalue">
                  {metrics.focus.focusMinutes} minutes
                </span>
              </div>
              {metrics.focus.trackingStatus === "legacy_untracked" && (
                <div className="yir-kpi-hint yir-kpi-hint--warning">
                  <span>Legacy untracked sessions recorded prior to session logging.</span>
                </div>
              )}
              {metrics.focus.trackingStatus === "not_tracked" && (
                <div className="yir-kpi-hint">
                  <span>Sessions not logged for this historical period.</span>
                </div>
              )}
              {metrics.focus.trackingStatus === "tracked" && (
                <div className="yir-kpi-hint yir-kpi-hint--success">
                  <span>Timestamped sessions verified for {year}.</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity XP Card */}
          <div className="yir-kpi-card yir-kpi-card--xp">
            <div className="yir-kpi-card__header">
              <div className="yir-kpi-card__icon">
                <FiZap />
              </div>
              <span className="yir-kpi-card__pill">Activity XP</span>
            </div>
            <div className="yir-kpi-card__body">
              <div className="yir-kpi-card__label-with-info">
                <span className="yir-kpi-card__label">Estimated Activity XP</span>
                <span className="yir-info-tooltip-btn" title={metrics.xp.disclaimer}>
                  <FiInfo size={14} />
                </span>
              </div>
              <div className="yir-kpi-card__value-row">
                <span className="yir-kpi-card__value">
                  +{metrics.xp.estimatedActivityXp.toLocaleString()}
                </span>
                <span className="yir-kpi-card__subvalue">
                  Total: {metrics.xp.totalXp.toLocaleString()} XP
                </span>
              </div>
              <div className="yir-xp-disclaimer">
                Goal +100 • Task +30 • Subtask +10 • Focus +15
              </div>
            </div>
          </div>
        </section>

        {/* 12-Month Task Velocity Bar Chart */}
        <section className="yir-panel">
          <div className="yir-panel__header">
            <div>
              <h3 className="yir-panel__title">Monthly Execution Velocity</h3>
              <p className="yir-panel__subtitle">
                Completed tasks by month throughout {year}
              </p>
            </div>
            {peakMonth?.completions > 0 && (
              <div className="yir-peak-badge">
                <FiTrendingUp /> Peak Month: <strong>{peakMonth.month}</strong> ({peakMonth.completions} completed)
              </div>
            )}
          </div>

          <div className="yir-chart-container">
            <div className="yir-chart-bars">
              {monthlyTrend.map((m) => {
                const heightPercent =
                  m.completions > 0
                    ? Math.max(Math.round((m.completions / maxCompletions) * 100), 10)
                    : 4;
                const isPeak = m.month === peakMonth?.month && m.completions > 0;

                return (
                  <div key={m.month} className="yir-chart-col">
                    <div
                      className="yir-chart-bar-wrapper"
                      title={`${m.month} ${year}: ${m.completions} tasks completed, ${m.created} created`}
                    >
                      <div className="yir-chart-tooltip">
                        <strong>{m.completions} completed</strong>
                        <small>{m.created} created</small>
                      </div>
                      <div
                        className={`yir-chart-bar ${isPeak ? "yir-chart-bar--peak" : ""}`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {isPeak && <span className="yir-peak-crown">🏆</span>}
                      </div>
                    </div>
                    <span className={`yir-chart-label ${isPeak ? "yir-chart-label--peak" : ""}`}>
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2-Column Section: Category Distribution & Priority Breakdown */}
        <div className="yir-grid-2col">
          {/* Domain & Category Distribution */}
          <section className="yir-panel">
            <div className="yir-panel__header">
              <div>
                <h3 className="yir-panel__title">Goal Focus Areas</h3>
                <p className="yir-panel__subtitle">
                  Where you invested your ambition across categories
                </p>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="yir-empty-state">
                <FiTarget />
                <p>No goals categorized in {year}.</p>
              </div>
            ) : (
              <div className="yir-category-list">
                {categories.map((cat) => (
                  <div key={cat.category} className="yir-cat-item">
                    <div className="yir-cat-item__meta">
                      <span className="yir-cat-item__name">{cat.category}</span>
                      <span className="yir-cat-item__count">
                        {cat.completed} / {cat.total} completed ({cat.rate}%)
                      </span>
                    </div>
                    <div className="yir-progress-track">
                      <div
                        className="yir-progress-fill yir-progress-fill--indigo"
                        style={{ width: `${Math.min(cat.rate, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Standout Achievements & Goals */}
          <section className="yir-panel">
            <div className="yir-panel__header">
              <div>
                <h3 className="yir-panel__title">Standout Goal Accomplishments</h3>
                <p className="yir-panel__subtitle">Key goals brought across the finish line</p>
              </div>
            </div>

            {standoutGoals.length === 0 ? (
              <div className="yir-empty-state">
                <FiAward />
                <p>No completed goals to display for {year}.</p>
              </div>
            ) : (
              <div className="yir-standout-list">
                {standoutGoals.map((g) => (
                  <div key={g._id} className="yir-standout-card">
                    <div className="yir-standout-card__header">
                      <h4 className="yir-standout-card__title">{g.title}</h4>
                      <span className={`priority-badge ${g.priority.toLowerCase()}`}>
                        {g.priority}
                      </span>
                    </div>
                    <div className="yir-standout-card__footer">
                      <span className="category-badge">{g.category}</span>
                      <span className="yir-standout-card__done">
                        <FiCheckCircle /> Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Milestone Badges & Medals */}
        <section className="yir-panel">
          <div className="yir-panel__header">
            <div>
              <h3 className="yir-panel__title">Milestone Badges & Honors</h3>
              <p className="yir-panel__subtitle">
                Productivity medals unlocked through discipline and persistence
              </p>
            </div>
            <span className="yir-tag">
              {achievements.length} Unlocked
            </span>
          </div>

          {achievements.length === 0 ? (
            <div className="yir-empty-state">
              <FiAward />
              <p>Keep completing tasks and focus sessions to unlock milestone medals!</p>
            </div>
          ) : (
            <div className="yir-badges-grid">
              {achievements.map((ach) => (
                <div key={ach.id} className="yir-badge-card">
                  <div className="yir-badge-card__icon">{ach.icon}</div>
                  <div className="yir-badge-card__body">
                    <div className="yir-badge-card__title-row">
                      <h4 className="yir-badge-card__title">{ach.title}</h4>
                      <span className={`yir-tier-badge yir-tier-badge--${ach.tier?.toLowerCase() || "bronze"}`}>
                        {ach.tier}
                      </span>
                    </div>
                    <p className="yir-badge-card__desc">{ach.description}</p>
                    <span className="yir-badge-card__bonus">+{ach.xpBonus} XP Bonus</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default YearInReview;
