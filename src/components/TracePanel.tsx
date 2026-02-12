import type { TraceEntry } from '../types/api';
import Collapsible from './Collapsible';
import '../styles/chat.css';

interface TracePanelProps {
  trace: TraceEntry[];
}

export default function TracePanel({ trace }: TracePanelProps) {
  if (!trace || trace.length === 0) return null;

  return (
    <Collapsible title={`🔗 Trace (${trace.length} entries)`}>
      <div>
        {trace.map((entry, i) => (
          <div key={i} className="trace-entry">
            <span className="trace-iter">{entry.iteration}</span>
            <div className="trace-details">
              <div className="trace-query">{entry.refined_query ?? '—'}</div>
              <div className="trace-info">
                <span>Docs: {entry.num_documents ?? 0}</span>
                <span>Retrieve: {entry.retrieve ? '✅' : '❌'}</span>
                {entry.retrieval_confidence != null && (
                  <span>Confidence: {entry.retrieval_confidence.toFixed(2)}</span>
                )}
                {entry.reason && <span>Reason: {entry.reason}</span>}
              </div>
              {entry.raw_query && (
                <div className="trace-info">
                  <span>Raw: {entry.raw_query}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Collapsible>
  );
}
