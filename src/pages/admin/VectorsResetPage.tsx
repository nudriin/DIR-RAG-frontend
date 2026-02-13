import { useState } from 'react';
import { postVectorsReset, ApiError } from '../../api/client';
import ErrorMessage from '../../components/ErrorMessage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Loader2, Trash2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function VectorsResetPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);

  const handleReset = async () => {
    setOpen(false);
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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Reset Vector Store</h2>
        <p className="text-muted-foreground">
          Hapus seluruh data di vector store. Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Zona Bahaya</span>
          </div>
          <CardTitle>Reset Total Vector Store</CardTitle>
          <CardDescription>
            Tindakan ini akan menghapus <strong>semua</strong> source dan chunks yang tersimpan.
            Database vector akan dikosongkan sepenuhnya. Pastikan Anda telah membackup data yang diperlukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Reset Vector Store
              </Button>
            </AlertDialogTrigger>
             <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Ini akan menghapus permanen semua data index dan chunks di vector store database Anda.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Ya, Reset Semuanya
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {success !== null && (
        <div className={`rounded-md p-4 border flex items-start gap-3 ${
          success 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900 text-green-800 dark:text-green-300' 
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {success ? <CheckCircle2 className="h-5 w-5 mt-0.5" /> : <XCircle className="h-5 w-5 mt-0.5" />}
          <div>
            <h3 className="text-sm font-medium">{success ? 'Berhasil' : 'Gagal'}</h3>
            <p className="text-sm mt-1">
              {success 
                ? 'Vector store berhasil di-reset. Semua data telah dihapus.' 
                : 'Gagal me-reset vector store. Silakan coba lagi.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
