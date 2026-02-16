import { useCallback, useEffect, useState } from "react"
import { getConversationDetail, getHistory, ApiError } from "../../api/client"
import type {
    ConversationDetail,
    ConversationMessage,
    ConversationSummary,
} from "../../types/api"
import ErrorMessage from "../../components/ErrorMessage"
import MarkdownText from "../../components/MarkdownText"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { RefreshCw } from "lucide-react"

export default function HistoryPage() {
    const [items, setItems] = useState<ConversationSummary[]>([])
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [detail, setDetail] = useState<ConversationDetail | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState<string | null>(null)

    const formatDate = (value?: string) =>
        value ? new Date(value).toLocaleString("id-ID") : "-"

    const mapMessages = (messages: ConversationMessage[]) =>
        messages.map((m) => ({
            role: m.role,
            content: m.content,
            confidence: m.confidence,
            rag_iterations: m.rag_iterations,
            created_at: m.created_at,
        }))

    const [detailMessages, setDetailMessages] = useState<
        ReturnType<typeof mapMessages>
    >([])

    const loadHistory = useCallback(
        async (append: boolean) => {
            setLoading(true)
            setError(null)
            try {
                const limit = 20
                const nextOffset = append ? offset : 0
                const data = await getHistory({ offset: nextOffset, limit })
                setItems((prev) => (append ? [...prev, ...data] : data))
                setOffset(nextOffset + data.length)
                setHasMore(data.length === limit)
            } catch (err) {
                if (err instanceof ApiError) {
                    setError(`Error ${err.status}: ${err.detail}`)
                } else {
                    setError("Terjadi kesalahan jaringan.")
                }
            } finally {
                setLoading(false)
            }
        },
        [offset],
    )

    const loadDetail = async (id: number) => {
        setDetailLoading(true)
        setDetailError(null)
        try {
            const data = await getConversationDetail(id)
            setDetail(data)
            setDetailMessages(mapMessages(data.messages))
        } catch (err) {
            if (err instanceof ApiError) {
                setDetailError(`Error ${err.status}: ${err.detail}`)
            } else {
                setDetailError("Terjadi kesalahan jaringan.")
            }
        } finally {
            setDetailLoading(false)
        }
    }

    useEffect(() => {
        loadHistory(false)
    }, [loadHistory])

    return (
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>History</CardTitle>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => loadHistory(false)}
                            disabled={loading}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {error && (
                        <ErrorMessage
                            message={error}
                            onDismiss={() => setError(null)}
                        />
                    )}
                    {loading && items.length === 0 ? (
                        <div className="flex items-center justify-center py-6">
                            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="rounded-md border border-dashed p-4 text-xs text-muted-foreground">
                            Belum ada percakapan.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => loadDetail(c.id)}
                                    className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${detail?.id === c.id ? "bg-primary/10 border-primary/20 text-primary" : "bg-background hover:bg-accent/50"}`}
                                >
                                    <div className="font-medium line-clamp-2">
                                        {c.title}
                                    </div>
                                    <div className="mt-1 text-[10px] text-muted-foreground">
                                        {formatDate(c.created_at)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    {hasMore && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadHistory(true)}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Load More
                        </Button>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle>Detail Percakapan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {detailError && (
                        <ErrorMessage
                            message={detailError}
                            onDismiss={() => setDetailError(null)}
                        />
                    )}
                    {detailLoading && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Memuat percakapan...
                        </div>
                    )}
                    {!detail && !detailLoading && (
                        <div className="rounded-md border border-dashed p-4 text-xs text-muted-foreground">
                            Pilih percakapan untuk melihat detail.
                        </div>
                    )}
                    {detail && (
                        <div className="space-y-4">
                            <div className="rounded-md border px-3 py-2 text-xs">
                                <div className="font-medium">
                                    {detail.title}
                                </div>
                                <div className="mt-1 text-[10px] text-muted-foreground">
                                    {formatDate(detail.created_at)}
                                </div>
                            </div>
                            <ScrollArea className="h-[520px]">
                                <div className="space-y-4 pr-2">
                                    {detailMessages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex gap-3",
                                                msg.role === "user"
                                                    ? "justify-end"
                                                    : "justify-start",
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[80%] rounded-xl px-3 py-2 text-xs shadow-sm",
                                                    msg.role === "user"
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted/50 border border-border text-foreground",
                                                )}
                                            >
                                                {msg.role === "user" ? (
                                                    <div className="whitespace-pre-wrap">
                                                        {msg.content}
                                                    </div>
                                                ) : (
                                                    <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed">
                                                        <MarkdownText
                                                            content={
                                                                msg.content
                                                            }
                                                        />
                                                    </div>
                                                )}
                                                {(msg.confidence != null ||
                                                    msg.rag_iterations !=
                                                        null) && (
                                                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                                                        {msg.confidence !=
                                                            null && (
                                                            <span>
                                                                Conf:{" "}
                                                                {(
                                                                    msg.confidence *
                                                                    100
                                                                ).toFixed(1)}
                                                                %
                                                            </span>
                                                        )}
                                                        {msg.rag_iterations !=
                                                            null && (
                                                            <span>
                                                                Iterasi:{" "}
                                                                {
                                                                    msg.rag_iterations
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
