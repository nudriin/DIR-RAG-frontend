import { useState } from 'react';
import { postChat, ApiError } from '../api/client';
import type { ChatResponse } from '../types/api';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import SourcesList from '../components/SourcesList';
import DebugPanel from '../components/DebugPanel';
import TracePanel from '../components/TracePanel';
import Collapsible from '../components/Collapsible';
import MarkdownText from '../components/MarkdownText';
import '../styles/chat.css';

export default function ChatPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ChatResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await postChat(trimmed);
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.detail}`);
      } else {
        setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFallback =
    result?.debug_logs?.final_status?.is_fallback ||
    result?.answer?.includes('Tidak ada informasi tersedia');

  const confidence = result?.confidence;
  const iterations = result?.iterations;

  return (
    <div className="chat-page">
      <div className="page-container">
        {/* Input Area */}
        <div className="chat-input-area">
          <form className="chat-input-wrapper" onSubmit={handleSubmit}>
            <input
              className="input"
              type="text"
              placeholder="Ketik pertanyaan Anda di sini..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button className="btn btn-primary" type="submit" disabled={loading || !query.trim()}>
              {loading ? <Spinner small /> : '🚀'} Kirim
            </button>
          </form>
        </div>

        {/* Error */}
        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {/* Loading */}
        {loading && <Spinner text="Sedang memproses pertanyaan..." />}

        {/* Result */}
        {result && (
          <div className="chat-result">
            {/* Fallback Banner */}
            {isFallback && (
              <div className="banner banner-warning fallback-banner">
                ⚠ Jawaban ini menggunakan fallback. Informasi mungkin tidak tersedia
                dalam dokumen yang di-ingest.
              </div>
            )}

            {/* Answer Card */}
            <div className="answer-card">
              <div className="answer-header">
                <h3>💡 Jawaban</h3>
                <div className="answer-meta">
                  {iterations != null && (
                    <div className="answer-meta-item">
                      Iterasi: <span className="answer-meta-value">{iterations}</span>
                    </div>
                  )}
                  {confidence != null && (
                    <div className="answer-meta-item">
                      Confidence:{' '}
                      <span className="answer-meta-value">
                        {(confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="answer-body">
                <MarkdownText content={result.answer ?? 'Tidak ada jawaban.'} />
              </div>
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <SourcesList sources={result.sources} />
            )}

            {/* Trace */}
            {result.trace && result.trace.length > 0 && (
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <TracePanel trace={result.trace} />
              </div>
            )}

            {/* Debug Panel */}
            {result.debug_logs && (
              <Collapsible title="🐛 Debug Logs">
                <DebugPanel debug={result.debug_logs} />
              </Collapsible>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
