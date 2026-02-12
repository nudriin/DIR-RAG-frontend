import { useState } from 'react';
import { postVectorsDeleteBySource, ApiError } from '../../api/client';
import type { VectorDeleteResponse } from '../../types/api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../../styles/admin.css';

export default function VectorsDeletePage() {
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VectorDeleteResponse | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setShowConfirm(false);
    const trimmed = source.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await postVectorsDeleteBySource(trimmed);
      setResult(data);
      setSource('');
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

  return (
    <div>
      <div className="admin-page-header">
        <h2>🗑 Delete by Source</h2>
        <p className="admin-page-desc">
          Hapus semua vector chunks berdasarkan nama source.
        </p>
      </div>

      <div className="vectors-action-card">
        <div className="form-group">
          <label>Source Name</label>
          <input
            className="input"
            type="text"
            placeholder="contoh: dokumen_panduan.pdf"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="btn btn-danger"
          onClick={() => setShowConfirm(true)}
          disabled={!source.trim() || loading}
        >
          {loading ? <Spinner small /> : '🗑'} Delete Source
        </button>

        {error && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="banner banner-success">
              ✅ Source "<strong>{result.source}</strong>" dihapus.
              Jumlah chunks yang dihapus: <strong>{result.deleted_count}</strong>
            </div>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Delete Source?"
          message={`Semua chunks dari source "${source.trim()}" akan dihapus. Lanjutkan?`}
          confirmLabel="Hapus"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
