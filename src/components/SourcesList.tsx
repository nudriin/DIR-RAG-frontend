import type { Source } from '../types/api';
import '../styles/chat.css';

interface SourcesListProps {
  sources: Source[];
}

export default function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) return null;

  return (
    <div className="sources-section">
      <div className="sources-title">
        📄 Sumber Referensi
        <span className="sources-count">{sources.length}</span>
      </div>
      <div className="sources-list">
        {sources.map((s, i) => (
          <div key={i} className="source-item">
            <span className="source-id">#{s.id}</span>
            <span className="source-name">{s.source ?? '—'}</span>
            {s.chunk_id && (
              <span className="source-chunk">chunk: {s.chunk_id}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
