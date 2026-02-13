import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVectorsSources, ApiError } from '../../api/client';
import type { VectorSourceEntry } from '../../types/api';
import ErrorMessage from '../../components/ErrorMessage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, Eye, Database } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Vector Sources</h2>
          <p className="text-muted-foreground">
            Daftar semua source yang tersimpan di vector store.
          </p>
        </div>
        <Button variant="outline" onClick={fetchSources} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <Card>
        <CardHeader>
          <CardTitle>Sources List</CardTitle>
          <CardDescription>Total sources: {sources.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center justify-center py-8">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : sources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Database className="mb-4 h-12 w-12 opacity-50" />
              <p>Belum ada source yang tersimpan.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Source Name</TableHead>
                  <TableHead className="w-[100px] text-center">Chunks</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((s, i) => (
                  <TableRow key={s.source}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{s.source}</TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {s.num_chunks}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/admin/vectors/source-detail?source=${encodeURIComponent(s.source)}`,
                          )
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
