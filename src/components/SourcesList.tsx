import type { Source } from '../types/api';
import { FileText } from 'lucide-react';

interface SourcesListProps {
  sources: Source[];
}

export default function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="rounded-md border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <FileText className="h-4 w-4" />
        <span>Sumber Referensi</span>
        <span className="flex h-5 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold text-primary">
          {sources.length}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((s, i) => (
          <div key={i} className="flex flex-col gap-1 rounded border bg-background p-3 text-sm transition-colors hover:bg-accent/50">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground">#{s.id}</span>
              {s.chunk_id && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  chk:{s.chunk_id}
                </span>
              )}
            </div>
            <div className="line-clamp-2 font-medium leading-tight text-foreground" title={s.source}>
              {s.source ?? '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
