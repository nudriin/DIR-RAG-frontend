import '../styles/admin.css';

interface RagasCardProps {
  ragas: Record<string, number>;
}

export default function RagasCard({ ragas }: RagasCardProps) {
  const entries = Object.entries(ragas);
  if (entries.length === 0) return null;

  return (
    <div className="ragas-card">
      <h4>📊 RAGAS Metrics</h4>
      {entries.map(([key, value]) => (
        <div key={key} className="ragas-item">
          <span className="ragas-label">{key}</span>
          <div className="ragas-bar-wrapper">
            <div
              className="ragas-bar"
              style={{ width: `${Math.min(value * 100, 100)}%` }}
            />
          </div>
          <span className="ragas-value">{value.toFixed(4)}</span>
        </div>
      ))}
    </div>
  );
}
