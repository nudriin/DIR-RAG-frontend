import { useState } from 'react';
import { postVectorsReset, ApiError } from '../../api/client';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../../styles/admin.css';

export default function VectorsResetPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await postVectorsReset();
      setSuccess(data.success);
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
        <h2>🔄 Reset Vector Store</h2>
        <p className="admin-page-desc">
          Hapus seluruh data di vector store. Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>

      <div className="vectors-action-card">
        <h3>⚠ Peringatan</h3>
        <p className="vectors-action-desc">
          Reset akan menghapus semua dokumen dan vector yang tersimpan.
          Pastikan Anda telah membackup data yang diperlukan.
        </p>

        <button
          className="btn btn-danger"
          onClick={() => setShowConfirm(true)}
          disabled={loading}
        >
          {loading ? <Spinner small /> : '🗑'} Reset Vector Store
        </button>

        {error && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {success !== null && (
          <div className="result-card">
            <div className={`banner ${success ? 'banner-success' : 'banner-error'}`}>
              {success ? '✅ Vector store berhasil di-reset.' : '❌ Gagal me-reset vector store.'}
            </div>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Reset Vector Store?"
          message="Semua data di vector store akan dihapus permanen. Apakah Anda yakin?"
          confirmLabel="Reset"
          variant="danger"
          onConfirm={handleReset}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
