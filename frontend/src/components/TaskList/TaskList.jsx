// TaskList.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchTasks } from "../../store/features/tasks/taskSlice";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorMessage from "../Common/ErrorMessage";
import TaskSearchAndFilters from "./TaskSearchAndFilters";
import DonutChart from "../GoalList/DonutChart";
import "./TaskList.css";

const TaskList = ({ tasks: propTasks, ownsData = false, goalDateRange }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const allTasks = useSelector((state) => state.tasks.items);
  const tasksStatus = useSelector((s) => s.tasks.status);
  const error = useSelector((state) => state.tasks.error);
  const tags = useSelector((state) => state.tags.items);
  const users = useSelector((state) => state.user.users);
  const userInfo = useSelector((state) => state.user.userInfo);

  // Helper for date formatting
  const formatDateForInput = (date) => date.toISOString().split("T")[0];

  // Calculate default month range
  const defaultDateRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: formatDateForInput(start),
      end: formatDateForInput(end),
    };
  }, []);

  // Filter/search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterDateRange, setFilterDateRange] = useState(defaultDateRange);

  useEffect(() => {
    if (!propTasks && allTasks.length === 0) {
      dispatch(fetchTasks());
    }
  }, [dispatch, propTasks, allTasks.length]);

  const tasks = useMemo(() => {
    let filtered = ownsData ? allTasks : propTasks ?? [];

    // Date range filter
    if (filterDateRange.start && filterDateRange.end) {
      const fStart = new Date(filterDateRange.start);
      const fEnd = new Date(filterDateRange.end);
      fEnd.setHours(23, 59, 59, 999);

      filtered = filtered.filter(task => {
        // Task must have at least an endDate or startDate
        if (!task.startDate && !task.endDate) return true;
        
        const tStart = new Date(task.startDate || task.endDate);
        const tEnd = new Date(task.endDate || task.startDate);
        
        // Overlap logic: task starts before filter ends AND task ends after filter starts
        return tStart <= fEnd && tEnd >= fStart;
      });
    }

    if (filterTag) {
      filtered = filtered.filter((task) =>
        (task.tags || []).includes(filterTag)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          (task.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [ownsData, propTasks, allTasks, filterTag, searchTerm, filterDateRange]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completionPercentage === 100).length;
    const highPriority = tasks.filter(t => t.priority === "High").length;
    const inProgress = tasks.filter(t => t.completionPercentage > 0 && t.completionPercentage < 100).length;
    
    return { total, completed, highPriority, inProgress };
  }, [tasks]);

  const chartData = useMemo(() => [
    { category: "Completed", value: stats.completed },
    { category: "In Progress", value: stats.inProgress },
    { category: "Not Started", value: stats.total - stats.completed - stats.inProgress },
  ], [stats]);

  if (tasksStatus === "loading") {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="enhanced-tasks-container">
      <div className="enhanced-tasks">
        {/* ── Top Bar ── */}
        <div className="enhanced-tasks__sidebar">
          <div className="enhanced-tasks__header">
            <div className="enhanced-tasks__header-title">
              <h2>
                <span className="header-icon--tasks">T</span>
                Tasks
              </h2>
            </div>

            {/* Inline Stats */}
            <div className="tasks__stats">
              <StatItem label="Total" value={stats.total} />
              <StatItem label="High Priority" value={stats.highPriority} color="red" />
              <StatItem label="Completed" value={stats.completed} color="green" />
            </div>

            <TaskSearchAndFilters
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
                className="enhanced-tasks__add-btn"
                onClick={() => navigate("/tasks/add")}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Area ── */}
        <div className="enhanced-tasks__main">
          <div className="enhanced-tasks__content">
            <div className="tk-table">
              <div className="tk-header">
                <div className="tk-col">Task</div>
                <div className="tk-col">Priority</div>
                <div className="tk-col">Tags</div>
                <div className="tk-col">End Date</div>
                <div className="tk-col">Progress</div>
              </div>

              {tasks.length === 0 ? (
                <div className="task-list__empty">
                  <p>No tasks found for this period.</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task._id} 
                    className="tk-row"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    <div className="tk-col">
                      <span className="tk-title">{task.name}</span>
                    </div>
                    <div className="tk-col">
                      <span className={`tk-priority tk-priority--${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="tk-col">
                       <div className="gl-chips">
                          {(task.tags || []).slice(0, 2).map(tagId => {
                            const tag = tags.find(t => t._id === tagId);
                            return tag ? <span key={tagId} className="gl-chip gl-chip--tag">{tag.name}</span> : null;
                          })}
                       </div>
                    </div>
                    <div className="tk-col">
                      <span className="gl-meta">{task.endDate ? new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"}</span>
                    </div>
                    <div className="tk-col">
                      <div className="tk-progress">
                        <div className="tk-progress__track">
                          <div 
                            className="tk-progress__fill" 
                            style={{ 
                              width: `${task.completionPercentage}%`,
                              backgroundColor: task.completionPercentage === 100 ? "var(--green)" : "var(--accent)"
                            }} 
                          />
                        </div>
                        <span className="tk-progress__pct">{task.completionPercentage}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="enhanced-tasks__chart-container">
            <p className="chart-section-title">Completion Status</p>
            <div className="enhanced-goals__chart-wrapper">
              <DonutChart data={chartData} />
            </div>
            <div className="enhanced-goals__insights-wrapper">
              <p className="insights-title">Summary</p>
              <div className="insights-grid">
                <p className="insight-desc" style={{ gridColumn: "span 2", fontSize: "11px", color: "var(--text-tertiary)", marginBottom: "8px" }}>
                   Showing tasks from {filterDateRange.start} to {filterDateRange.end}
                </p>
                <InsightCard label="Active" value={stats.total - stats.completed} />
                <InsightCard label="Done" value={stats.completed} color="green" />
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
    <p style={{ color: color === "red" ? "var(--red)" : color === "green" ? "var(--green)" : "inherit" }}>
      {value}
    </p>
  </div>
);

const InsightCard = ({ label, value, color }) => (
  <div className="insight-card">
    <div className="insight-card__label">{label}</div>
    <div className="insight-card__value" style={{ color: color === "green" ? "var(--green)" : "var(--text-primary)" }}>
      {value}
    </div>
  </div>
);

export default TaskList;
