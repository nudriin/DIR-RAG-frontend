import { useMemo, useState } from "react"
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
import { Loader2, Send, AlertTriangle, Lightbulb, Bug } from "lucide-react"
import InlineThinking from "@/components/InlineThinking"
import useThinkingStream from "@/hooks/useThinkingStream"
import type { RAGStage } from "@/api/logsStream"
import { useConversation } from "@/context/conversation-store"

export default function ChatPage() {
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<ChatResponse | null>(null)
    const { activeConversationId, setActiveConversationId, resetConversation } =
        useConversation()
    const {
        events: thinkingEvents,
        isThinking,
        startListening,
        reset,
    } = useThinkingStream()
    const [filters, setFilters] = useState<Record<RAGStage, boolean>>({
        rq_rag: true,
        retrieval: true,
        reranker: true,
        dragin: true,
        generation: true,
        final_status: true,
        log: false,
    })
    const filteredThinkingEvents = useMemo(
        () =>
            thinkingEvents.filter((e) => {
                const stage = (e.stage ?? "log") as RAGStage
                return filters[stage]
            }),
        [thinkingEvents, filters],
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = query.trim()
        if (!trimmed) return

        setLoading(true)
        setError(null)
        setResult(null)
        reset()
        await startListening()

        try {
            let data: ChatResponse | null = null
            try {
                data = await postChat({
                    query: trimmed,
                    conversationId: activeConversationId,
                })
            } catch (err) {
                if (
                    err instanceof ApiError &&
                    err.status === 404 &&
                    activeConversationId != null
                ) {
                    setError("Percakapan tidak ditemukan, memulai baru")
                    resetConversation()
                    data = await postChat({ query: trimmed })
                } else {
                    throw err
                }
            }
            if (data) {
                setResult(data)
                setActiveConversationId(data.conversation_id)
            }
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

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col">
            {/* Input Area */}
            <div className="border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:p-6">
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
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                    <div>
                        {/* Error */}
                        {error && (
                            <ErrorMessage
                                message={error}
                                onDismiss={() => setError(null)}
                            />
                        )}

                        {/* Loading */}
                        {loading && !result && (
                            <Card className="border-primary/20 shadow-md">
                                <CardHeader className="bg-primary/5 pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Lightbulb className="h-6 w-6 text-primary" />
                                            <CardTitle>Jawaban</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <InlineThinking
                                        events={filteredThinkingEvents}
                                        isThinking={isThinking}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Result */}
                        {result && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                                {/* Fallback Banner */}
                                {isFallback && (
                                    <div className="flex items-center gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                                        <AlertTriangle className="h-5 w-5 shrink-0" />
                                        <p>
                                            Jawaban ini menggunakan fallback.
                                            Informasi mungkin tidak tersedia
                                            dalam dokumen yang di-ingest.
                                        </p>
                                    </div>
                                )}

                                {/* Answer Card */}
                                <Card className="border-primary/20 shadow-md">
                                    <CardHeader className="bg-primary/5 pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Lightbulb className="h-6 w-6 text-primary" />
                                                <CardTitle>
                                                    Jawaban AI
                                                </CardTitle>
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
                                                            {(
                                                                confidence * 100
                                                            ).toFixed(1)}
                                                            %
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                                            {filteredThinkingEvents.length >
                                                0 &&
                                                !loading && (
                                                    <div className="mb-4">
                                                        <InlineThinking
                                                            events={
                                                                filteredThinkingEvents
                                                            }
                                                            isThinking={
                                                                isThinking
                                                            }
                                                        />
                                                    </div>
                                                )}
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
                                {result.sources &&
                                    result.sources.length > 0 && (
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
                    </div>
                    <aside className="space-y-3">
                        <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                            <div className="border-b bg-muted/20 px-4 py-3">
                                <span className="text-sm font-semibold">
                                    Filter Thinking
                                </span>
                            </div>
                            <div className="px-4 py-3">
                                <div className="grid grid-cols-1 gap-3 text-xs">
                                    {Object.keys(filters).map((k) => (
                                        <label
                                            key={k}
                                            className="flex items-center justify-between gap-3"
                                        >
                                            <span className="capitalize">
                                                {k.replace("_", " ")}
                                            </span>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={
                                                    filters[k as RAGStage]
                                                }
                                                onClick={() =>
                                                    setFilters({
                                                        ...filters,
                                                        [k]: !filters[
                                                            k as RAGStage
                                                        ],
                                                    })
                                                }
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors ${filters[k as RAGStage] ? "bg-primary border-primary" : "bg-muted border-border"}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${filters[k as RAGStage] ? "translate-x-4" : "translate-x-0.5"}`}
                                                />
                                            </button>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
