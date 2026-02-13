import { useState, useRef } from 'react';
import { postIngest, ApiError } from '../../api/client';
import type { IngestResponse } from '../../types/api';
import ErrorMessage from '../../components/ErrorMessage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, CloudUpload } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Ingest Dokumen</h2>
        <p className="text-muted-foreground">
          Upload file PDF atau HTML untuk ditambahkan ke vector store.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>Drag & drop file di sini atau klik untuk memilih.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors hover:bg-muted/50 cursor-pointer",
              file ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25",
              "hover:border-primary/50"
            )}
            onClick={() => fileRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
              {file ? <FileText className="h-8 w-8" /> : <CloudUpload className="h-8 w-8" />}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {file ? file.name : 'Klik atau drag file ke sini'}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, HTML (max. sesuai konfigurasi backend)
              </p>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.html,.htm"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button 
            onClick={handleUpload} 
            disabled={!file || loading} 
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload & Ingest
          </Button>
        </CardContent>
      </Card>

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
           <div className="flex flex-col items-center gap-2">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="text-sm text-muted-foreground">Mengupload dan memproses dokumen...</p>
           </div>
        </div>
      )}

      {result && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
             <CardTitle className="text-lg">Ingest Berhasil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col rounded-lg border p-3 text-center">
                <span className="text-xs uppercase text-muted-foreground">Source</span>
                <span className="font-mono text-lg font-bold break-all">{result.source}</span>
              </div>
              <div className="flex flex-col rounded-lg border p-3 text-center">
                <span className="text-xs uppercase text-muted-foreground">Chunks</span>
                <span className="font-mono text-lg font-bold">{result.num_chunks}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
