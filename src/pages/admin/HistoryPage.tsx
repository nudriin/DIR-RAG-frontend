import { useCallback, useEffect, useState } from "react"
import {
    deleteAllHistory,
    deleteConversationHistory,
    exportConversation,
    getConversationDetail,
    getHistory,
    submitFeedback,
    ApiError,
} from "../../api/client"
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
import { Textarea } from "@/components/ui/textarea"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useConversation } from "@/context/conversation-store"
import { cn } from "@/lib/utils"
import { Loader2, RefreshCw, Trash2 } from "lucide-react"

export default function HistoryPage() {
    const [items, setItems] = useState<ConversationSummary[]>([])
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [detail, setDetail] = useState<ConversationDetail | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState<string | null>(null)
    const [exporting, setExporting] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] =
        useState<ConversationSummary | null>(null)
    const [deleteAllOpen, setDeleteAllOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [deletingAll, setDeletingAll] = useState(false)
    const { activeConversationId, resetConversation } = useConversation()

    const formatDate = (value?: string) =>
        value ? new Date(value).toLocaleString("id-ID") : "-"

    const mapMessages = (messages: ConversationMessage[]) =>
        messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            confidence: m.confidence,
            rag_iterations: m.rag_iterations,
            created_at: m.created_at,
        }))

    const [detailMessages, setDetailMessages] = useState<
        ReturnType<typeof mapMessages>
    >([])
    const [feedbackState, setFeedbackState] = useState<
        Record<
            number,
            {
                score: number | null
                comment: string
                submitting: boolean
                success: boolean
                error: string | null
            }
        >
    >({})

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
            setFeedbackState({})
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

    const updateFeedback = (
        messageId: number,
        patch: Partial<{
            score: number | null
            comment: string
            submitting: boolean
            success: boolean
            error: string | null
        }>,
    ) => {
        setFeedbackState((prev) => {
            const current = prev[messageId] ?? {
                score: null,
                comment: "",
                submitting: false,
                success: false,
                error: null,
            }
            return {
                ...prev,
                [messageId]: {
                    ...current,
                    ...patch,
                },
            }
        })
    }

    const handleSubmitFeedback = async (messageId: number) => {
        const current = feedbackState[messageId]
        if (!current?.score) return
        updateFeedback(messageId, { submitting: true, error: null })
        try {
            await submitFeedback({
                messageId,
                score: current.score,
                comment: current.comment.trim() ? current.comment.trim() : null,
            })
            updateFeedback(messageId, { submitting: false, success: true })
        } catch (err) {
            if (err instanceof ApiError) {
                updateFeedback(messageId, {
                    submitting: false,
                    error: err.detail,
                })
            } else {
                updateFeedback(messageId, {
                    submitting: false,
                    error: "Terjadi kesalahan jaringan.",
                })
            }
        }
    }

    const handleExportConversation = async () => {
        if (!detail?.id) return
        setExporting(true)
        setDetailError(null)
        try {
            await exportConversation(detail.id)
        } catch (err) {
            if (err instanceof ApiError) {
                setDetailError(`Error ${err.status}: ${err.detail}`)
            } else {
                setDetailError("Terjadi kesalahan jaringan.")
            }
        } finally {
            setExporting(false)
        }
    }

    const handleDeleteConversation = async () => {
        if (!deleteTarget) return
        setDeletingId(deleteTarget.id)
        setError(null)
        try {
            await deleteConversationHistory(deleteTarget.id)
            setItems((prev) => prev.filter((c) => c.id !== deleteTarget.id))
            if (detail?.id === deleteTarget.id) {
                setDetail(null)
                setDetailMessages([])
                setFeedbackState({})
            }
            if (activeConversationId === deleteTarget.id) {
                resetConversation()
            }
            window.dispatchEvent(new Event("history:deleted"))
            setDeleteOpen(false)
            setDeleteTarget(null)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(
                    err.status === 404
                        ? "Percakapan sudah tidak ada."
                        : `Error ${err.status}: ${err.detail}`,
                )
                setItems((prev) => prev.filter((c) => c.id !== deleteTarget.id))
            } else {
                setError("Terjadi kesalahan jaringan.")
            }
        } finally {
            setDeletingId(null)
        }
    }

    const handleDeleteAll = async () => {
        setDeletingAll(true)
        setError(null)
        try {
            await deleteAllHistory()
            setItems([])
            setOffset(0)
            setHasMore(false)
            setDetail(null)
            setDetailMessages([])
            setFeedbackState({})
            if (activeConversationId != null) {
                resetConversation()
            }
            window.dispatchEvent(new Event("history:deleted"))
            setDeleteAllOpen(false)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`Error ${err.status}: ${err.detail}`)
            } else {
                setError("Terjadi kesalahan jaringan.")
            }
        } finally {
            setDeletingAll(false)
        }
    }

    useEffect(() => {
        loadHistory(false)
    }, [loadHistory])

    return (
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle>History</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <AlertDialog
                                open={deleteAllOpen}
                                onOpenChange={setDeleteAllOpen}
                            >
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeleteAllOpen(true)}
                                    disabled={loading || deletingAll}
                                    className="shrink-0"
                                >
                                    {deletingAll ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    Delete All History
                                </Button>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Hapus semua percakapan?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Yakin ingin menghapus SEMUA
                                            percakapan? Data percakapan dan
                                            feedback akan hilang permanen.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Batal
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAll}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Ya, Hapus Semua
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadHistory(false)}
                                disabled={loading}
                                className="shrink-0"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
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
                                <div
                                    key={c.id}
                                    className="flex items-start gap-2"
                                >
                                    <button
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
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-9 w-9 text-destructive hover:text-destructive"
                                        onClick={() => {
                                            setDeleteTarget(c)
                                            setDeleteOpen(true)
                                        }}
                                        disabled={deletingId === c.id}
                                    >
                                        {deletingId === c.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
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

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Hapus percakapan ini?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Yakin ingin menghapus percakapan ini? Tindakan ini
                            tidak bisa dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConversation}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>Detail Percakapan</CardTitle>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleExportConversation}
                            disabled={!detail || exporting}
                        >
                            {exporting ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Export Percakapan Ini
                        </Button>
                    </div>
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
                                                {msg.role === "assistant" && (
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex flex-wrap gap-2">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((score) => {
                                                                const feedback =
                                                                    feedbackState[
                                                                        msg.id
                                                                    ] ?? {
                                                                        score: null,
                                                                        comment:
                                                                            "",
                                                                        submitting: false,
                                                                        success: false,
                                                                        error: null,
                                                                    }
                                                                return (
                                                                    <Button
                                                                        key={
                                                                            score
                                                                        }
                                                                        size="sm"
                                                                        variant={
                                                                            feedback.score ===
                                                                            score
                                                                                ? "default"
                                                                                : "outline"
                                                                        }
                                                                        onClick={() =>
                                                                            updateFeedback(
                                                                                msg.id,
                                                                                {
                                                                                    score,
                                                                                    success: false,
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        {score}
                                                                    </Button>
                                                                )
                                                            })}
                                                        </div>
                                                        <Textarea
                                                            rows={2}
                                                            placeholder="Komentar (opsional)"
                                                            value={
                                                                feedbackState[
                                                                    msg.id
                                                                ]?.comment ?? ""
                                                            }
                                                            onChange={(e) =>
                                                                updateFeedback(
                                                                    msg.id,
                                                                    {
                                                                        comment:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        success: false,
                                                                    },
                                                                )
                                                            }
                                                            className="text-xs"
                                                            disabled={
                                                                feedbackState[
                                                                    msg.id
                                                                ]?.submitting
                                                            }
                                                        />
                                                        <div className="flex flex-wrap items-center gap-3 text-[10px]">
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleSubmitFeedback(
                                                                        msg.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !feedbackState[
                                                                        msg.id
                                                                    ]?.score ||
                                                                    feedbackState[
                                                                        msg.id
                                                                    ]
                                                                        ?.submitting
                                                                }
                                                            >
                                                                {feedbackState[
                                                                    msg.id
                                                                ]
                                                                    ?.submitting ? (
                                                                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                                                                ) : null}
                                                                Kirim Feedback
                                                            </Button>
                                                            {feedbackState[
                                                                msg.id
                                                            ]?.success && (
                                                                <span className="text-green-600">
                                                                    Feedback
                                                                    tersimpan
                                                                </span>
                                                            )}
                                                            {feedbackState[
                                                                msg.id
                                                            ]?.error && (
                                                                <span className="text-destructive">
                                                                    {
                                                                        feedbackState[
                                                                            msg
                                                                                .id
                                                                        ]?.error
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
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
