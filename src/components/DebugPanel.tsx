import type { DebugLogs } from "../types/api"
import Collapsible from "./Collapsible"
import IterationCard from "./IterationCard"
import EntropyChart from "./EntropyChart"
import { BrainCircuit, RefreshCw, CheckCircle } from "lucide-react"

interface DebugPanelProps {
    debug: DebugLogs
}

export default function DebugPanel({ debug }: DebugPanelProps) {
    const rq_rag = debug.rq_rag
    const iterations = debug.iterations ?? []
    const final_status = debug.final_status

    return (
        <div className="space-y-4">
            {/* RQ-RAG Section */}
            {rq_rag && (
                <Collapsible
                    title={
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4" />
                            <span>RQ-RAG (Query Refinement)</span>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-muted-foreground">
                                Refined Query
                            </span>
                            <span className="font-medium text-foreground">
                                {rq_rag.refined_query ?? "—"}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-muted-foreground">
                                Docs Retrieved
                            </span>
                            <span className="font-medium text-foreground">
                                {rq_rag.docs_retrieved ?? 0}
                            </span>
                        </div>

                        {rq_rag.sub_queries &&
                            rq_rag.sub_queries.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Sub Queries
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {rq_rag.sub_queries.map((q, i) => (
                                            <span
                                                key={i}
                                                className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground text-wrap break-all"
                                            >
                                                {q}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {rq_rag.source_names &&
                            rq_rag.source_names.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Source Names
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {rq_rag.source_names.map((s, i) => (
                                            <span
                                                key={i}
                                                className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground text-wrap break-all"
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                </Collapsible>
            )}

            {/* Iterations */}
            {iterations.length > 0 && (
                <Collapsible
                    title={
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            <span>Iterations ({iterations.length} steps)</span>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        {iterations.map((iter, i) => (
                            <IterationCard key={i} data={iter} />
                        ))}
                    </div>
                </Collapsible>
            )}

            {/* Final Status */}
            {final_status && (
                <Collapsible
                    title={
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Final Status</span>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-muted-foreground">
                                Stop Reason
                            </span>
                            <span className="font-medium text-foreground">
                                {final_status.stop_reason ?? "—"}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-muted-foreground">
                                Is Fallback
                            </span>
                            <span className="">
                                {final_status.is_fallback ? (
                                    <span className="inline-flex items-center rounded-md border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200">
                                        Yes
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200">
                                        No
                                    </span>
                                )}
                            </span>
                        </div>

                        {final_status.entropy_history &&
                            final_status.entropy_history.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Entropy History
                                    </span>
                                    <div className="rounded-md border p-2">
                                        <EntropyChart
                                            values={
                                                final_status.entropy_history
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                    </div>
                </Collapsible>
            )}
        </div>
    )
}
