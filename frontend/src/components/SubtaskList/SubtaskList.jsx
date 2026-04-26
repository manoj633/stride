// SubtaskList.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchSubtasks } from "../../store/features/subtasks/subtaskSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import SubtaskSearchAndFilters from "./SubtaskSearchAndFilters";
import DonutChart from "../GoalList/DonutChart";
import "./SubtaskList.css";

const SubtaskList = ({ subtasks: propSubtasks, ownsData = false, taskDateRange }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allSubtasks = useSelector((state) => state.subtasks.items);
  const loading = useSelector((state) => state.subtasks.status);
  const error = useSelector((state) => state.subtasks.error);
  const tags = useSelector((state) => state.tags.items);

  // Default month range
  const defaultDateRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const formatDate = (d) => d.toISOString().split("T")[0];
    return { start: formatDate(start), end: formatDate(end) };
  }, []);

  // Filter/search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterDateRange, setFilterDateRange] = useState(defaultDateRange);

  useEffect(() => {
    if (!propSubtasks && allSubtasks.length === 0) {
      dispatch(fetchSubtasks());
    }
  }, [dispatch, propSubtasks, allSubtasks.length]);

  const subtasks = useMemo(() => {
    let filtered = ownsData ? allSubtasks : propSubtasks ?? [];

    // Date range filter
    if (filterDateRange.start && filterDateRange.end) {
      const fStart = new Date(filterDateRange.start);
      const fEnd = new Date(filterDateRange.end);
      fEnd.setHours(23, 59, 59, 999);

      filtered = filtered.filter(st => {
        if (!st.dueDate) return true;
        const dDate = new Date(st.dueDate);
        return dDate >= fStart && dDate <= fEnd;
      });
    }

    if (filterTag) {
      filtered = filtered.filter((st) => (st.tags || []).includes(filterTag));
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (st) =>
          (st.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (st.description || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [propSubtasks, allSubtasks, filterTag, filterDateRange, searchTerm, ownsData]);

  const stats = useMemo(() => {
    const total = subtasks.length;
    const completed = subtasks.filter(s => s.completed).length;
    const highPriority = subtasks.filter(s => s.priority === "High").length;
    return { total, completed, pending: total - completed, highPriority };
  }, [subtasks]);

  const chartData = useMemo(() => [
    { category: "Completed", value: stats.completed },
    { category: "Pending", value: stats.pending },
  ], [stats]);

  if (loading === "loading") return <LoadingSpinner message="Loading subtasks..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="enhanced-subtasks-container">
      <div className="enhanced-subtasks">
        {/* ── Top Bar ── */}
        <div className="enhanced-subtasks__sidebar">
          <div className="enhanced-subtasks__header">
            <div className="enhanced-subtasks__header-title">
              <h2>
                <span className="header-icon--subtasks">S</span>
                Subtasks
              </h2>
            </div>

            {/* Inline Stats */}
            <div className="subtasks__stats">
              <StatItem label="Total" value={stats.total} />
              <StatItem label="High Priority" value={stats.highPriority} color="red" />
              <StatItem label="Pending" value={stats.pending} color="amber" />
            </div>

            <SubtaskSearchAndFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterTag={filterTag}
              setFilterTag={setFilterTag}
              filterDateRange={filterDateRange}
              setFilterDateRange={setFilterDateRange}
              availableTags={tags}
            />

            <div className="enhanced-tasks__actions">
              <button
                className="stk-add-btn"
                onClick={() => navigate("/subtasks/add")}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Subtask
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Area ── */}
        <div className="enhanced-subtasks__main">
          <div className="enhanced-subtasks__content">
            <div className="stk-table">
              <div className="stk-header">
                <div className="stk-col">Subtask</div>
                <div className="stk-col">Priority</div>
                <div className="stk-col">Status</div>
                <div className="stk-col">Due Date</div>
              </div>

              {subtasks.length === 0 ? (
                <div className="task-list__empty">
                  <p>No subtasks found for this period.</p>
                </div>
              ) : (
                subtasks.map(st => (
                  <div 
                    key={st._id} 
                    className="stk-row"
                    onClick={() => navigate(`/subtasks/${st._id}`)}
                  >
                    <div className="stk-col">
                      <span className="stk-title">{st.name}</span>
                    </div>
                    <div className="stk-col">
                      <span className={`tk-priority tk-priority--${st.priority?.toLowerCase() || 'low'}`}>
                        {st.priority || 'Low'}
                      </span>
                    </div>
                    <div className="stk-col">
                      <span className={`stk-status stk-status--${st.completed ? 'completed' : 'pending'}`}>
                        {st.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div className="stk-col">
                      <span className="gl-meta">
                        {st.dueDate ? new Date(st.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="enhanced-subtasks__chart-container">
            <p className="chart-section-title">Status Breakdown</p>
            <div className="enhanced-goals__chart-wrapper">
              <DonutChart data={chartData} />
            </div>
            <div className="enhanced-goals__insights-wrapper">
              <p className="insights-title">Summary</p>
              <div className="insights-grid">
                <InsightCard label="Done" value={stats.completed} color="green" />
                <InsightCard label="Pending" value={stats.pending} color="amber" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color }) => (
  <div className="stat-item">
    <h3>{label}</h3>
    <p style={{ color: color === "red" ? "var(--red)" : color === "amber" ? "var(--amber)" : "inherit" }}>
      {value}
    </p>
  </div>
);

const InsightCard = ({ label, value, color }) => (
  <div className="insight-card">
    <div className="insight-card__label">{label}</div>
    <div className="insight-card__value" style={{ color: color === "green" ? "var(--green)" : color === "amber" ? "var(--amber)" : "var(--text-primary)" }}>
      {value}
    </div>
  </div>
);

export default SubtaskList;
