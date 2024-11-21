const KanbanBoard = ({ goals }) => (
  <div className="enhanced-goals__kanban">
    <div className="kanban-column">
      <h3>Not Started</h3>
      {goals
        .filter((g) => g.completionPercentage === 0)
        .map((goal) => (
          <div key={goal._id} className="kanban-card">
            <h4>{goal.title}</h4>
            <span className={`priority-badge ${goal.priority.toLowerCase()}`}>
              {goal.priority}
            </span>
          </div>
        ))}
    </div>
    <div className="kanban-column">
      <h3>In Progress</h3>
      {goals
        .filter(
          (g) => g.completionPercentage > 0 && g.completionPercentage < 100
        )
        .map((goal) => (
          <div key={goal._id} className="kanban-card">
            <h4>{goal.title}</h4>
            <span className={`priority-badge ${goal.priority.toLowerCase()}`}>
              {goal.priority}
            </span>
          </div>
        ))}
    </div>
    <div className="kanban-column">
      <h3>Completed</h3>
      {goals
        .filter((g) => g.completionPercentage === 100)
        .map((goal) => (
          <div key={goal._id} className="kanban-card">
            <h4>{goal.title}</h4>
            <span className={`priority-badge ${goal.priority.toLowerCase()}`}>
              {goal.priority}
            </span>
          </div>
        ))}
    </div>
  </div>
);

export default KanbanBoard;
