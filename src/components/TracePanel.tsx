import type { TraceEntry } from '../types/api';
import { cn } from '@/lib/utils';
import { Activity, Check, X } from 'lucide-react';

interface TracePanelProps {
  trace: TraceEntry[];
}

export default function TracePanel({ trace }: TracePanelProps) {
  if (!trace || trace.length === 0) return null;

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-3 text-sm font-semibold">
        <Activity className="h-4 w-4" />
        <span>Riwayat Trace</span>
      </div>
      <div className="space-y-0 divide-y divide-border">
        {trace.map((entry, i) => (
          <div key={i} className="grid grid-cols-[40px_1fr] gap-4 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {entry.iteration}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">
                {entry.refined_query ?? '—'}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-background px-2 py-0.5 border">Docs: {entry.num_documents ?? 0}</span>
                <span className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 border",
                  entry.retrieve
                    ? 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-900'
                    : 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900'
                )}>
                  {entry.retrieve ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {entry.retrieve ? 'Retrieve' : 'Skip'}
                </span>
                {entry.retrieval_confidence != null && (
                  <span className="rounded bg-background px-2 py-0.5 border">Conf: {entry.retrieval_confidence.toFixed(2)}</span>
                )}
                {entry.reason && (
                  <span className="rounded bg-background px-2 py-0.5 border">Reason: {entry.reason}</span>
                )}
              </div>
              {entry.raw_query && (
                <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">Raw:</span> {entry.raw_query}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
