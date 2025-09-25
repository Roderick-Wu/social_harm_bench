type AgentStat = {
  model: string;
  score: number;
  reputation: number;
};

type AgentStatsProps = {
  stats: AgentStat[];
};

export default function AgentStats({ stats }: AgentStatsProps) {
return (
    <div className="stats-container">
      <h2 className="stats-header">Agent Stats</h2>
      
      <div className="stats-list">
        {stats.length === 0 ? (
          <div className="empty-state">
            <p>No stats available yet</p>
          </div>
        ) : (
          stats.map(({ model, score, reputation }, i) => (
            <div key={i} className="stat-card">
              <div className="stat-model">{model}</div>
              
              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-label">Score</span>
                  <span className="stat-value score">
                    {typeof score === 'number' ? score.toFixed(2) : score}
                  </span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-label">Reputation</span>
                  <span className="stat-value reputation">
                    {typeof reputation === 'number' ? reputation.toFixed(2) : reputation}
                  </span>
                </div>
              </div>
              
              <div className="progress-bars">
                {typeof score === 'number' && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill score"
                      style={{ width: `${Math.min(Math.max((score / 100) * 100, 0), 100)}%` }}
                    ></div>
                  </div>
                )}
                {typeof reputation === 'number' && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill reputation"
                      style={{ width: `${Math.min(Math.max((reputation / 100) * 100, 0), 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {stats.length > 1 && (
        <div className="rankings-summary">
          <h3 className="rankings-title">Quick Rankings</h3>
          <div className="rankings-list">
            <div>
              Top Score: {stats.reduce((prev, curr) => (curr.score > prev.score) ? curr : prev).model}
            </div>
            <div>
              Top Reputation: {stats.reduce((prev, curr) => (curr.reputation > prev.reputation) ? curr : prev).model}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}