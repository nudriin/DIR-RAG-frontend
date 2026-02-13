import { useState } from 'react';
import { postEvaluate, ApiError } from '../../api/client';
import type { EvaluateResponse } from '../../types/api';
import ErrorMessage from '../../components/ErrorMessage';
import RagasCard from '../../components/RagasCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Evaluate</h2>
        <p className="text-muted-foreground">
          Evaluasi performa RAG pipeline dengan kumpulan pertanyaan dan ground truth (opsional).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Evaluasi</CardTitle>
          <CardDescription>Masukkan data untuk menjalankan evaluasi RAGAS.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="questions">Questions (satu per baris) *</Label>
              <Textarea
                id="questions"
                rows={5}
                placeholder={"Apa itu machine learning?\nBagaimana cara kerja neural network?"}
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groundTruth">Ground Truth Answers (opsional)</Label>
              <Textarea
                id="groundTruth"
                rows={5}
                placeholder={"Machine learning adalah...\nNeural network bekerja dengan..."}
                value={groundTruth}
                onChange={(e) => setGroundTruth(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Harus sejajar dengan questions. Kosongkan jika tidak ada.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="docIds">Relevant Doc IDs (opsional, JSON array)</Label>
              <Textarea
                id="docIds"
                rows={3}
                placeholder={'[["doc_id_1", "doc_id_2"], ["doc_id_3"]]'}
                value={docIds}
                onChange={(e) => setDocIds(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Format: [["id1","id2"], ["id3"]]</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Jalankan Evaluasi
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.hit_rate.toFixed(4)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.mrr.toFixed(4)}</div>
              </CardContent>
            </Card>
          </div>

          {Object.keys(result.ragas).length > 0 && (
            <RagasCard ragas={result.ragas} />
          )}
        </div>
      )}
    </div>
  );
}
