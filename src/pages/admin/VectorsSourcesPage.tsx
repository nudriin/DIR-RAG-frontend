import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVectorsSources, ApiError } from '../../api/client';
import type { VectorSourceEntry } from '../../types/api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import '../../styles/admin.css';

export default function VectorsSourcesPage() {
  const [sources, setSources] = useState<VectorSourceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVectorsSources();
      setSources(data.sources);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.detail}`);
      } else {
        setError('Terjadi kesalahan jaringan.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h2>📚 Vector Sources</h2>
            <p className="admin-page-desc">
              Daftar semua source yang tersimpan di vector store.
            </p>
          </div>
          <button className="btn btn-ghost" onClick={fetchSources} disabled={loading}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {loading && <Spinner text="Memuat daftar sources..." />}

      {!loading && sources.length === 0 && !error && (
        <div className="banner banner-info">
          Belum ada source yang tersimpan di vector store.
        </div>
      )}

      {sources.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Source</th>
                <th>Chunks</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s, i) => (
                <tr key={s.source}>
                  <td>{i + 1}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{s.source}</td>
                  <td>
                    <span className="badge badge-info">{s.num_chunks}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        navigate(
                          `/admin/vectors/source-detail?source=${encodeURIComponent(s.source)}`,
                        )
                      }
                    >
                      👁 Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
