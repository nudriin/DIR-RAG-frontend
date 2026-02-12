import type { DebugIteration } from '../types/api';
import '../styles/chat.css';

interface IterationCardProps {
  data: DebugIteration;
}

export default function IterationCard({ data }: IterationCardProps) {
  const { step, iter_retgen, dragin, etc } = data;

  const trend = etc?.current_trend ?? 'stable';
  const trendClass =
    trend === 'improving'
      ? 'trend-improving'
      : trend === 'declining'
        ? 'trend-declining'
        : 'trend-stable';

  return (
    <div className="iteration-card">
      <div className="iteration-header">
        <span className="iteration-step">Step {step}</span>
        {iter_retgen && (
          <span className="iteration-executing">{iter_retgen.executing}</span>
        )}
      </div>

      {iter_retgen && (
        <>
          <div className="iteration-grid">
            <div className="iteration-field">
              <span className="iteration-field-label">Query</span>
              <span className="iteration-field-value">{iter_retgen.iter_query ?? '—'}</span>
            </div>
            <div className="iteration-field">
              <span className="iteration-field-label">New Docs</span>
              <span className="iteration-field-value">{iter_retgen.new_docs_found ?? 0}</span>
            </div>
            <div className="iteration-field">
              <span className="iteration-field-label">Pruning Kept</span>
              <span className="iteration-field-value">{iter_retgen.pruning_kept ?? 0}</span>
            </div>
            <div className="iteration-field">
              <span className="iteration-field-label">Pruning Discarded</span>
              <span className="iteration-field-value">{iter_retgen.pruning_discarded ?? 0}</span>
            </div>
          </div>

          {iter_retgen.current_draft && (
            <div className="iteration-field" style={{ marginTop: 'var(--space-sm)' }}>
              <span className="iteration-field-label">Draft Preview</span>
              <div className="draft-preview">
                {iter_retgen.current_draft.slice(0, 150)}
                {iter_retgen.current_draft.length > 150 ? '…' : ''}
              </div>
            </div>
          )}
        </>
      )}

      {dragin && (
        <div className="dragin-section">
          <div className="dragin-title">🔍 DRAGIN</div>
          <div className="iteration-grid">
            <div className="iteration-field">
              <span className="iteration-field-label">Entropy</span>
              <span className="iteration-field-value">
                {dragin.entropy != null ? dragin.entropy.toFixed(4) : '—'}
              </span>
            </div>
            <div className="iteration-field">
              <span className="iteration-field-label">Triggered</span>
              <span className="iteration-field-value">
                {dragin.triggered_retrieval ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="iteration-field" style={{ gridColumn: '1 / -1' }}>
              <span className="iteration-field-label">Reason</span>
              <span className="iteration-field-value">{dragin.reason ?? '—'}</span>
            </div>
          </div>
        </div>
      )}

      {etc && (
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <span className={`trend-badge ${trendClass}`}>
            {trend === 'improving' ? '↑' : trend === 'declining' ? '↓' : '→'}
            {' '}{trend}
          </span>
        </div>
      )}
    </div>
  );
}
