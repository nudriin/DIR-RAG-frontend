import { useState } from 'react';
import { postVectorsDeleteBySource, ApiError } from '../../api/client';
import type { VectorDeleteResponse } from '../../types/api';
import ErrorMessage from '../../components/ErrorMessage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2, CheckCircle2 } from 'lucide-react';

export default function VectorsDeletePage() {
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VectorDeleteResponse | null>(null);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setOpen(false);
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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Delete by Source</h2>
        <p className="text-muted-foreground">
          Hapus semua vector chunks berdasarkan nama source.
        </p>
      </div>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle>Hapus Source Document</CardTitle>
          <CardDescription>
            Tindakan ini akan menghapus semua potongan teks (chunks) yang terkait dengan nama file source tertentu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">Source Name</Label>
            <Input
              id="source"
              placeholder="contoh: dokumen_panduan.pdf"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              disabled={loading}
            />
          </div>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={!source.trim() || loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete Source
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Source?</AlertDialogTitle>
                <AlertDialogDescription>
                  Semua chunks dari source <span className="font-mono font-medium text-foreground">"{source.trim()}"</span> akan dihapus permanen dari vector store. Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {result && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Penghapusan Berhasil</h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                <p>
                  Source <strong>"{result.source}"</strong> telah dihapus.
                  Total <strong>{result.deleted_count}</strong> chunks dihapus.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
