import { useState, useRef } from 'react';
import { postIngest, ApiError } from '../../api/client';
import type { IngestResponse } from '../../types/api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import '../../styles/admin.css';

const ALLOWED_TYPES = ['application/pdf', 'text/html'];
const ALLOWED_EXTENSIONS = ['.pdf', '.html', '.htm'];

export default function IngestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): boolean => {
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
    if (!ALLOWED_TYPES.includes(f.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Hanya file PDF atau HTML yang diperbolehkan.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) {
      setFile(f);
      setError(null);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && validateFile(f)) {
      setFile(f);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await postIngest(file);
      setResult(data);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
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
        <h2>📥 Ingest Dokumen</h2>
        <p className="admin-page-desc">
          Upload file PDF atau HTML untuk ditambahkan ke vector store.
        </p>
      </div>

      <div
        className={`upload-zone ${file ? 'has-file' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="upload-icon">{file ? '📄' : '☁'}</div>
        <div className="upload-text">
          {file ? 'File siap di-upload' : 'Klik atau drag file ke sini'}
        </div>
        <div className="upload-hint">PDF, HTML (max. sesuai konfigurasi backend)</div>
        {file && <div className="upload-filename">{file.name}</div>}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.html,.htm"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div style={{ marginTop: 'var(--space-md)' }}>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? <Spinner small /> : '📤'} Upload & Ingest
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {loading && <Spinner text="Mengupload dan memproses dokumen..." />}

      {result && (
        <div className="ingest-result">
          <div className="ingest-result-stat">
            <div className="ingest-result-label">Source</div>
            <div className="ingest-result-value">{result.source}</div>
          </div>
          <div className="ingest-result-stat">
            <div className="ingest-result-label">Chunks</div>
            <div className="ingest-result-value">{result.num_chunks}</div>
          </div>
        </div>
      )}
    </div>
  );
}
