import type { DebugLogs } from '../types/api';
import Collapsible from './Collapsible';
import IterationCard from './IterationCard';
import EntropyChart from './EntropyChart';
import '../styles/chat.css';

interface DebugPanelProps {
  debug: DebugLogs;
}

export default function DebugPanel({ debug }: DebugPanelProps) {
  const rq_rag = debug.rq_rag;
  const iterations = debug.iterations ?? [];
  const final_status = debug.final_status;

  return (
    <div className="debug-section">
      {/* RQ-RAG Section */}
      {rq_rag && (
        <Collapsible title="🧠 RQ-RAG (Query Refinement)">
          <div>
            <div className="kv-row">
              <span className="kv-key">Refined Query</span>
              <span className="kv-value">{rq_rag.refined_query ?? '—'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Docs Retrieved</span>
              <span className="kv-value">{rq_rag.docs_retrieved ?? 0}</span>
            </div>

            {rq_rag.sub_queries && rq_rag.sub_queries.length > 0 && (
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <span className="iteration-field-label">Sub Queries</span>
                <div className="tag-list" style={{ marginTop: '4px' }}>
                  {rq_rag.sub_queries.map((q, i) => (
                    <span key={i} className="tag">{q}</span>
                  ))}
                </div>
              </div>
            )}

            {rq_rag.source_names && rq_rag.source_names.length > 0 && (
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <span className="iteration-field-label">Source Names</span>
                <div className="tag-list" style={{ marginTop: '4px' }}>
                  {rq_rag.source_names.map((s, i) => (
                    <span key={i} className="tag">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Collapsible>
      )}

      {/* Iterations */}
      {iterations.length > 0 && (
        <Collapsible title={`🔄 Iterations (${iterations.length} steps)`}>
          <div>
            {iterations.map((iter, i) => (
              <IterationCard key={i} data={iter} />
            ))}
          </div>
        </Collapsible>
      )}

      {/* Final Status */}
      {final_status && (
        <Collapsible title="✅ Final Status">
          <div>
            <div className="kv-row">
              <span className="kv-key">Stop Reason</span>
              <span className="kv-value">{final_status.stop_reason ?? '—'}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Is Fallback</span>
              <span className="kv-value">
                {final_status.is_fallback ? (
                  <span className="badge badge-warning">Yes</span>
                ) : (
                  <span className="badge badge-success">No</span>
                )}
              </span>
            </div>

            {final_status.entropy_history && final_status.entropy_history.length > 0 && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <span className="iteration-field-label">Entropy History</span>
                <div style={{ marginTop: '8px' }}>
                  <EntropyChart values={final_status.entropy_history} />
                </div>
              </div>
            )}
          </div>
        </Collapsible>
      )}
    </div>
  );
}
