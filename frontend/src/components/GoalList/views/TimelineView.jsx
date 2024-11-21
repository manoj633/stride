const TimelineView = ({ goals }) => (
  <div className="enhanced-goals__timeline">
    {goals
      .sort(
        (a, b) =>
          new Date(a.duration.startDate) - new Date(b.duration.startDate)
      )
      .map((goal) => (
        <div key={goal._id} className="timeline-item">
          <div className="timeline-date">
            {new Date(goal.duration.startDate).toLocaleDateString()} -
            {new Date(goal.duration.endDate).toLocaleDateString()}
          </div>
          <div className="timeline-content">
            <h4>{goal.title}</h4>
            <div className="timeline-progress">
              <div
                className="progress-bar"
                style={{ width: `${goal.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
  </div>
);

export default TimelineView;
