export function DistributionBars({ distribution }: { distribution: Record<string, number> }) {
  const entries = Object.entries(distribution);
  const max = Math.max(...entries.map(([, count]) => count), 1);

  if (!entries.length) {
    return <p className="helper-text">No submissions yet.</p>;
  }

  return (
    <div className="score-bars">
      {entries.map(([name, count]) => (
        <div className="score-row" key={name}>
          <div className="score-row-top">
            <span>{name}</span>
            <span>{count}</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.round((count / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
