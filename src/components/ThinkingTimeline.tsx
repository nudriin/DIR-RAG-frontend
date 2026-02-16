import { useEffect, useRef, memo } from "react"
import type { RAGEvent, RAGStage } from "@/api/logsStream"
import Collapsible from "./Collapsible"

type Filters = Record<RAGStage, boolean>

interface Props {
    events: RAGEvent[]
    filters: Filters
}

const stageLabel: Record<RAGStage, string> = {
    rq_rag: "Refinement",
    retrieval: "Retrieval",
    reranker: "Reranker",
    dragin: "DRAGIN",
    generation: "Generasi",
    final_status: "Final",
    log: "Log",
}

const stageBadge: Record<RAGStage, string> = {
    rq_rag: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900",
    retrieval:
        "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900",
    reranker:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900",
    dragin: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900",
    generation:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900",
    final_status:
        "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-900",
    log: "bg-muted text-muted-foreground border",
}

function ThinkingTimeline({ events, filters }: Props) {
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [events.length])

    const filtered = events.filter((e) => {
        const k = (e.stage ?? "log") as RAGStage
        return filters[k] ?? false
    })

    return (
        <div className="rounded-md border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
                <span className="text-sm font-semibold">Thinking Timeline</span>
                <span className="text-xs text-muted-foreground">
                    {filtered.length} events
                </span>
            </div>
            <div className="p-2 space-y-2">
                {filtered.map((e, i) => {
                    const stage = (e.stage ?? "log") as RAGStage
                    const badge = stageBadge[stage]
                    const label = stageLabel[stage]
                    if (e.rawText) {
                        return (
                            <div
                                key={i}
                                className="rounded-md border-l-2 p-2 font-mono text-xs bg-background"
                                style={{ borderLeftColor: undefined }}
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`rounded px-2 py-0.5 border ${badge}`}
                                    >
                                        {label}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {e.time ?? ""}
                                    </span>
                                </div>
                                <div className="mt-2 whitespace-pre-wrap break-words">
                                    {e.rawText}
                                </div>
                            </div>
                        )
                    }
                    return (
                        <div key={i} className="rounded-md border-l-2">
                            <div className="flex items-center justify-between px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`rounded px-2 py-0.5 border ${badge}`}
                                    >
                                        {label}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {e.summary ?? ""}
                                    </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {e.time ?? ""}
                                </span>
                            </div>
                            {e.details && (
                                <Collapsible
                                    title={
                                        <span className="text-xs text-muted-foreground px-3">
                                            Details
                                        </span>
                                    }
                                >
                                    <div className="px-3 pb-3">
                                        <div className="grid gap-1 text-xs">
                                            {Object.entries(e.details).map(
                                                ([k, v]) => (
                                                    <div
                                                        key={k}
                                                        className="flex justify-between gap-2"
                                                    >
                                                        <span className="text-muted-foreground">
                                                            {k}
                                                        </span>
                                                        <span className="font-mono">
                                                            {typeof v ===
                                                            "string"
                                                                ? v
                                                                : JSON.stringify(
                                                                      v,
                                                                  )}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </Collapsible>
                            )}
                        </div>
                    )
                })}
                <div ref={endRef} />
            </div>
        </div>
    )
}

export default memo(ThinkingTimeline)
