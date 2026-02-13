import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getVectorsSourceDetail, ApiError } from '../../api/client';
import type { VectorSourceDetailResponse } from '../../types/api';
import ErrorMessage from '../../components/ErrorMessage';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ArrowLeft, FileText, Database } from 'lucide-react';

function ChunkCard({ docId, chunkId, content }: { docId: string; chunkId?: string; content: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 p-3">
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="rounded-md bg-background border px-2 py-1">doc: {docId}</span>
          {chunkId && <span className="rounded-md bg-background border px-2 py-1">chunk: {chunkId}</span>}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className={`relative ${!expanded ? 'max-h-[100px] overflow-hidden' : ''}`}>
           <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{content}</p>
           {!expanded && content.length > 200 && (
             <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
           )}
        </div>
        {content.length > 200 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 h-auto p-0 text-xs text-primary hover:bg-transparent hover:text-primary/80"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Sembunyikan' : 'Tampilkan lebih'}
          </Button>
        )}
      </CardContent>
    </Card>
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
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link to="/admin/vectors/sources">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Source Detail</h2>
        </div>
        
        {source && (
           <div className="flex items-center gap-2 text-muted-foreground ml-10">
             <FileText className="h-4 w-4" />
             <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{source}</code>
             {data && <span className="text-sm border-l pl-2 ml-2">{data.num_chunks} chunks</span>}
           </div>
        )}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="flex-1 rounded-md border p-4">
          <div className="space-y-4">
            {data && data.chunks.length > 0 ? (
              data.chunks.map((chunk, i) => (
                <ChunkCard
                  key={i}
                  docId={chunk.doc_id}
                  chunkId={chunk.chunk_id}
                  content={chunk.content}
                />
              ))
            ) : (
               !error && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Database className="mb-4 h-12 w-12 opacity-50" />
                  <p>Tidak ada chunks untuk source ini.</p>
                </div>
               )
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
