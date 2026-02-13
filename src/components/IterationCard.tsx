import type { DebugIteration } from '../types/api';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, Check, X } from 'lucide-react';

interface IterationCardProps {
  data: DebugIteration;
}

export default function IterationCard({ data }: IterationCardProps) {
  const { step, iter_retgen, dragin, etc } = data;

  const trend = etc?.current_trend ?? 'stable';
  const trendColor =
    trend === 'improving'
      ? 'text-green-600 bg-green-50 border-green-200 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200'
      : trend === 'declining'
        ? 'text-red-600 bg-red-50 border-red-200 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200'
        : 'text-muted-foreground bg-muted border-border';

  return (
    <div className="rounded-md border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center justify-between border-b pb-2">
        <span className="font-mono text-sm font-bold text-primary">Step {step}</span>
        {iter_retgen && (
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {iter_retgen.executing}
          </span>
        )}
      </div>

      {iter_retgen && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Query</span>
              <span className="text-sm font-medium text-foreground text-wrap break-all" title={iter_retgen.iter_query ?? ''}>
                {iter_retgen.iter_query ?? '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">New Docs</span>
              <span className="text-sm font-medium text-foreground">{iter_retgen.new_docs_found ?? 0}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Pruning Kept</span>
              <span className="text-sm font-medium text-foreground">{iter_retgen.pruning_kept ?? 0}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Pruning Discarded</span>
              <span className="text-sm font-medium text-foreground">{iter_retgen.pruning_discarded ?? 0}</span>
            </div>
          </div>

          {iter_retgen.current_draft && (
            <div className="mt-4 flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Draft Preview</span>
              <div className="rounded border bg-muted/30 p-2 text-xs font-mono text-muted-foreground">
                {iter_retgen.current_draft.slice(0, 150)}
                {iter_retgen.current_draft.length > 150 ? '…' : ''}
              </div>
            </div>
          )}
        </>
      )}

      {dragin && (
        <div className="mt-4 rounded border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/50 dark:bg-indigo-900/10">
          <div className="mb-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">🔍 DRAGIN Analysis</div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Entropy</span>
              <span className="text-sm font-mono font-medium text-foreground">
                {dragin.entropy != null ? dragin.entropy.toFixed(4) : '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Triggered</span>
              <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                {dragin.triggered_retrieval ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />}
                {dragin.triggered_retrieval ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-3">
              <span className="text-xs font-medium text-muted-foreground">Reason</span>
              <span className="text-sm text-foreground">{dragin.reason ?? '—'}</span>
            </div>
          </div>
        </div>
      )}

      {etc && (
        <div className="mt-4 flex justify-end">
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", trendColor)}>
            {trend === 'improving' ? <ArrowUp className="h-3 w-3" /> : trend === 'declining' ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
}
