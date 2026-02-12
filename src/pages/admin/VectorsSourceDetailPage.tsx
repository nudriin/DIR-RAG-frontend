import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getVectorsSourceDetail, ApiError } from '../../api/client';
import type { VectorSourceDetailResponse } from '../../types/api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import '../../styles/admin.css';

function ChunkCard({ docId, chunkId, content }: { docId: string; chunkId?: string; content: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="chunk-card">
      <div className="chunk-header">
        <div className="chunk-ids">
          <span className="tag">doc: {docId}</span>
          {chunkId && <span className="tag">chunk: {chunkId}</span>}
        </div>
      </div>
      <div className={`chunk-content line-clamp ${expanded ? 'expanded' : ''}`}>
        {content}
      </div>
      {content.length > 200 && (
        <button className="show-more-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? '▲ Sembunyikan' : '▼ Tampilkan lebih'}
        </button>
      )}
    </div>
  );
}

export default function VectorsSourceDetailPage() {
  const [params] = useSearchParams();
  const source = params.get('source') ?? '';
  const [data, setData] = useState<VectorSourceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      setError('Parameter "source" tidak ditemukan.');
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getVectorsSourceDetail(source);
        setData(result);
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

    fetchDetail();
  }, [source]);

  return (
    <div>
      <div className="admin-page-header">
        <Link to="/admin/vectors/sources" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-sm)' }}>
          ← Kembali ke Sources
        </Link>
        <h2>📄 Source Detail</h2>
        {source && (
          <p className="admin-page-desc">
            Source: <code>{source}</code>
            {data && <> — {data.num_chunks} chunks</>}
          </p>
        )}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {loading && <Spinner text="Memuat detail source..." />}

      {data && data.chunks.length > 0 && (
        <div>
          {data.chunks.map((chunk, i) => (
            <ChunkCard
              key={i}
              docId={chunk.doc_id}
              chunkId={chunk.chunk_id}
              content={chunk.content}
            />
          ))}
        </div>
      )}

      {data && data.chunks.length === 0 && (
        <div className="banner banner-info">Tidak ada chunks untuk source ini.</div>
      )}
    </div>
  );
}
