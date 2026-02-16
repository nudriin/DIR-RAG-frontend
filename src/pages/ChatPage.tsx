import { useEffect, useRef, useState } from "react"
import { postChat, ApiError } from "../api/client"
import type { ChatResponse } from "../types/api"
import ErrorMessage from "../components/ErrorMessage"
import SourcesList from "../components/SourcesList"
import DebugPanel from "../components/DebugPanel"
import TracePanel from "../components/TracePanel"
import Collapsible from "../components/Collapsible"
import MarkdownText from "../components/MarkdownText"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Loader2,
    Send,
    AlertTriangle,
    Lightbulb,
    Bug,
    Sparkles,
} from "lucide-react"
import ThinkingTimeline from "@/components/ThinkingTimeline"
import { LogsStreamClient, type RAGEvent } from "@/api/logsStream"

export default function ChatPage() {
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<ChatResponse | null>(null)
    const [events, setEvents] = useState<RAGEvent[]>([])
    const [filters, setFilters] = useState<Record<string, boolean>>({
        rq_rag: true,
        retrieval: true,
        reranker: true,
        dragin: true,
        generation: true,
        final_status: true,
        log: true,
    })
    const [streaming, setStreaming] = useState(false)
    const [streamError, setStreamError] = useState<string | null>(null)
    const [connected, setConnected] = useState(false)
    const clientRef = useRef<LogsStreamClient | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = query.trim()
        if (!trimmed) return

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const data = await postChat(trimmed)
            setResult(data)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`Error ${err.status}: ${err.detail}`)
            } else {
                setError("Terjadi kesalahan jaringan. Silakan coba lagi.")
            }
        } finally {
            setLoading(false)
        }
    }

    const isFallback =
        result?.debug_logs?.final_status?.is_fallback ||
        result?.answer?.includes("Tidak ada informasi tersedia")

    const confidence = result?.confidence
    const iterations = result?.iterations

    useEffect(() => {
        if (events.some((e) => e.stage === "final_status")) {
            stopStream()
        }
    }, [events])

    function startStream() {
        if (streaming) return
        setEvents([])
        setStreamError(null)
        const client = new LogsStreamClient()
        clientRef.current = client
        client.connect(
            (e) => {
                setConnected(true)
                setEvents((prev) => {
                    const next = [...prev, e]
                    if (next.length > 500) next.shift()
                    return next
                })
            },
            () => {
                setConnected(false)
                setStreamError("Stream terputus, mencoba menghubungkan ulang…")
            },
        )
        setStreaming(true)
    }

    function stopStream() {
        clientRef.current?.close()
        clientRef.current = null
        setStreaming(false)
        setStreamError(null)
        setConnected(false)
    }

    useEffect(() => {
        if (clientRef.current) return
        setEvents([])
        setStreamError(null)
        const client = new LogsStreamClient()
        clientRef.current = client
        client.connect(
            (e) => {
                setConnected(true)
                setEvents((prev) => {
                    const next = [...prev, e]
                    if (next.length > 500) next.shift()
                    return next
                })
            },
            () => {
                setConnected(false)
                setStreamError("Stream terputus, mencoba menghubungkan ulang…")
            },
        )
        setStreaming(true)
        return () => {
            clientRef.current?.close()
        }
    }, [])

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col">
            {/* Input Area - Sticky Top */}
            <div className="sticky top-16 z-10 border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:p-6">
                <div className="mx-auto max-w-3xl">
                    <form className="flex gap-2" onSubmit={handleSubmit}>
                        <Textarea
                            className="h-auto min-h-[96px] text-base shadow-sm resize-y"
                            placeholder="Ketik pertanyaan Anda di sini..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={loading}
                            autoFocus
                            rows={3}
                        />
                        <Button
                            size="lg"
                            className="h-12 px-6"
                            type="submit"
                            disabled={loading || !query.trim()}
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Kirim
                        </Button>
                    </form>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl flex-1 p-4 sm:p-6">
                {/* Error */}
                {error && (
                    <ErrorMessage
                        message={error}
                        onDismiss={() => setError(null)}
                    />
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-medium">
                            Sedang memproses pertanyaan...
                        </p>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        {/* Fallback Banner */}
                        {isFallback && (
                            <div className="flex items-center gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p>
                                    Jawaban ini menggunakan fallback. Informasi
                                    mungkin tidak tersedia dalam dokumen yang
                                    di-ingest.
                                </p>
                            </div>
                        )}

                        {/* Answer Card */}
                        <Card className="border-primary/20 shadow-md">
                            <CardHeader className="bg-primary/5 pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-6 w-6 text-primary" />
                                        <CardTitle>Jawaban AI</CardTitle>
                                    </div>
                                    <div className="flex gap-3 text-xs font-medium text-muted-foreground">
                                        {iterations != null && (
                                            <div className="rounded-full bg-background border px-2.5 py-1">
                                                Iterasi:{" "}
                                                <span className="font-mono text-primary">
                                                    {iterations}
                                                </span>
                                            </div>
                                        )}
                                        {confidence != null && (
                                            <div className="rounded-full bg-background border px-2.5 py-1">
                                                Conf:{" "}
                                                <span className="font-mono text-primary">
                                                    {(confidence * 100).toFixed(
                                                        1,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="prose prose-neutral dark:prose-invert max-w-none">
                                    <MarkdownText
                                        content={
                                            result.answer ??
                                            "Tidak ada jawaban."
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sources */}
                        {result.sources && result.sources.length > 0 && (
                            <SourcesList sources={result.sources} />
                        )}

                        {/* Trace */}
                        {result.trace && result.trace.length > 0 && (
                            <TracePanel trace={result.trace} />
                        )}

                        {/* Debug Panel */}
                        {result.debug_logs && (
                            <Collapsible
                                title={
                                    <div className="flex items-center gap-2">
                                        <Bug className="h-4 w-4" />
                                        <span>Debug Logs</span>
                                    </div>
                                }
                            >
                                <DebugPanel debug={result.debug_logs} />
                            </Collapsible>
                        )}
                    </div>
                )}
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div />
                    <div className="space-y-3">
                        <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                            <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold">
                                        Thinking Timeline
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${connected ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                                    >
                                        {connected
                                            ? "Connected"
                                            : "Disconnected"}
                                    </span>
                                    {streaming ? (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={stopStream}
                                        >
                                            Stop
                                        </Button>
                                    ) : (
                                        <Button size="sm" onClick={startStream}>
                                            Start
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEvents([])}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                            {streamError && (
                                <div className="px-4 py-2 text-xs text-yellow-700 dark:text-yellow-200">
                                    {streamError}
                                </div>
                            )}
                            <div className="px-4 py-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.keys(filters).map((k) => (
                                        <label
                                            key={k}
                                            className="flex items-center gap-2"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    filters[
                                                        k as keyof typeof filters
                                                    ]
                                                }
                                                onChange={(e) =>
                                                    setFilters({
                                                        ...filters,
                                                        [k]: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span className="capitalize">
                                                {k.replace("_", " ")}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <ThinkingTimeline
                                events={events}
                                filters={{
                                    rq_rag: !!filters.rq_rag,
                                    retrieval: !!filters.retrieval,
                                    reranker: !!filters.reranker,
                                    dragin: !!filters.dragin,
                                    generation: !!filters.generation,
                                    final_status: !!filters.final_status,
                                    log: !!filters.log,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
