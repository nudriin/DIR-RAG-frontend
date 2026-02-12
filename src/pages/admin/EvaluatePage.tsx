import { useState } from 'react';
import { postEvaluate, ApiError } from '../../api/client';
import type { EvaluateResponse } from '../../types/api';
import Spinner from '../../components/Spinner';
import ErrorMessage from '../../components/ErrorMessage';
import RagasCard from '../../components/RagasCard';
import '../../styles/admin.css';

export default function EvaluatePage() {
  const [questions, setQuestions] = useState('');
  const [groundTruth, setGroundTruth] = useState('');
  const [docIds, setDocIds] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluateResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const qList = questions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (qList.length === 0) {
      setError('Masukkan minimal satu pertanyaan.');
      return;
    }

    const gtList = groundTruth.trim()
      ? groundTruth
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    if (gtList && gtList.length !== qList.length) {
      setError(
        `Jumlah ground_truth_answers (${gtList.length}) harus sama dengan questions (${qList.length}).`,
      );
      return;
    }

    let parsedDocIds: string[][] | undefined;
    if (docIds.trim()) {
      try {
        parsedDocIds = JSON.parse(docIds.trim());
        if (!Array.isArray(parsedDocIds)) throw new Error('not array');
        if (parsedDocIds.length !== qList.length) {
          setError(
            `Jumlah relevant_doc_ids (${parsedDocIds.length}) harus sama dengan questions (${qList.length}).`,
          );
          return;
        }
      } catch {
        setError('relevant_doc_ids harus berupa JSON array of arrays, contoh: [["doc1"],["doc2"]]');
        return;
      }
    }

    setLoading(true);
    try {
      const data = await postEvaluate({
        questions: qList,
        ground_truth_answers: gtList,
        relevant_doc_ids: parsedDocIds,
      });
      setResult(data);
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
        <h2>📊 Evaluate</h2>
        <p className="admin-page-desc">
          Evaluasi performa RAG pipeline dengan pertanyaan dan ground truth opsional.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Questions (satu per baris) *</label>
          <textarea
            className="textarea"
            rows={5}
            placeholder={"Apa itu machine learning?\nBagaimana cara kerja neural network?"}
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Ground Truth Answers (opsional, sejajar dengan questions)</label>
          <textarea
            className="textarea"
            rows={5}
            placeholder={"Machine learning adalah...\nNeural network bekerja dengan..."}
            value={groundTruth}
            onChange={(e) => setGroundTruth(e.target.value)}
            disabled={loading}
          />
          <p className="form-hint">Kosongkan jika tidak ada ground truth</p>
        </div>

        <div className="form-group">
          <label>Relevant Doc IDs (opsional, JSON array of arrays)</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder={'[["doc_id_1", "doc_id_2"], ["doc_id_3"]]'}
            value={docIds}
            onChange={(e) => setDocIds(e.target.value)}
            disabled={loading}
          />
          <p className="form-hint">Format: [["id1","id2"], ["id3"]]</p>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <Spinner small /> : '🚀'} Jalankan Evaluasi
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {loading && <Spinner text="Menjalankan evaluasi..." />}

      {result && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <div className="evaluate-results">
            <div className="evaluate-metric">
              <div className="evaluate-metric-label">Hit Rate</div>
              <div className="evaluate-metric-value">{result.hit_rate.toFixed(4)}</div>
            </div>
            <div className="evaluate-metric">
              <div className="evaluate-metric-label">MRR</div>
              <div className="evaluate-metric-value">{result.mrr.toFixed(4)}</div>
            </div>
          </div>

          {Object.keys(result.ragas).length > 0 && (
            <div style={{ marginTop: 'var(--space-md)' }}>
              <RagasCard ragas={result.ragas} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
