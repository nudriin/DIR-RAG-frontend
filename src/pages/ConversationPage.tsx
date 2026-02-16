import { useCallback, useState, useRef, useEffect } from "react"
import { Send, Bot, User, RefreshCw, Plus } from "lucide-react"
import {
    postChat,
    ApiError,
    getHistory,
    getConversationDetail,
    getDashboardStats,
} from "../api/client"
import type {
    ChatResponse,
    ConversationMessage,
    ConversationSummary,
    DashboardStats,
} from "../types/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MarkdownText from "../components/MarkdownText"
import ErrorMessage from "../components/ErrorMessage"
import { cn } from "@/lib/utils"
import InlineThinking from "@/components/InlineThinking"
import useThinkingStream from "@/hooks/useThinkingStream"
import { useConversation } from "@/context/conversation-store"

interface Message {
    role: "user" | "assistant"
    content: string
    isError?: boolean
    confidence?: number | null
    rag_iterations?: number | null
    created_at?: string
}

export default function ConversationPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [chatError, setChatError] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const {
        events: thinkingEvents,
        isThinking,
        startListening,
        reset,
    } = useThinkingStream()
    const {
        activeConversationId,
        setActiveConversationId,
        conversations,
        setConversations,
        setConversationDetail,
        resetConversation,
    } = useConversation()
    const [historyOffset, setHistoryOffset] = useState(0)
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyError, setHistoryError] = useState<string | null>(null)
    const [historyHasMore, setHistoryHasMore] = useState(true)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detailError, setDetailError] = useState<string | null>(null)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [statsLoading, setStatsLoading] = useState(false)
    const [statsError, setStatsError] = useState<string | null>(null)

    const formatDate = (value?: string) =>
        value ? new Date(value).toLocaleString("id-ID") : "-"

    const mapMessages = (items: ConversationMessage[]): Message[] =>
        items.map((m) => ({
            role: m.role,
            content: m.content,
            confidence: m.confidence,
            rag_iterations: m.rag_iterations,
            created_at: m.created_at,
        }))

    const loadHistory = useCallback(
        async (offset: number, append: boolean) => {
            setHistoryLoading(true)
            setHistoryError(null)
            try {
                const limit = 20
                const data = await getHistory({ offset, limit })
                setConversations((prev) => (append ? [...prev, ...data] : data))
                setHistoryOffset(offset + data.length)
                setHistoryHasMore(data.length === limit)
            } catch (err) {
                if (err instanceof ApiError) {
                    setHistoryError(`Error ${err.status}: ${err.detail}`)
                } else {
                    setHistoryError("Terjadi kesalahan jaringan.")
                }
            } finally {
                setHistoryLoading(false)
            }
        },
        [setConversations],
    )

    const loadDetail = async (id: number) => {
        setDetailLoading(true)
        setDetailError(null)
        try {
            const detail = await getConversationDetail(id)
            setConversationDetail(detail)
            setActiveConversationId(detail.id)
            setMessages(mapMessages(detail.messages))
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

    const loadStats = useCallback(async () => {
        setStatsLoading(true)
        setStatsError(null)
        try {
            const data = await getDashboardStats()
            setStats(data)
        } catch (err) {
            if (err instanceof ApiError) {
                setStatsError(`Error ${err.status}: ${err.detail}`)
            } else {
                setStatsError("Terjadi kesalahan jaringan.")
            }
        } finally {
            setStatsLoading(false)
        }
    }, [])

    const handleNewChat = () => {
        resetConversation()
        setMessages([])
        setQuery("")
        setLoading(false)
        setChatError(null)
    }

    useEffect(() => {
        loadHistory(0, false)
        loadStats()
    }, [loadHistory, loadStats])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim() || loading) return

        const userMessage = query.trim()
        setQuery("")
        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: userMessage,
                created_at: new Date().toISOString(),
            },
        ])
        setLoading(true)
        setChatError(null)
        reset()
        await startListening()

        try {
            const previousConversationId = activeConversationId
            let data: ChatResponse | null = null
            try {
                data = await postChat({
                    query: userMessage,
                    conversationId: previousConversationId,
                })
            } catch (err) {
                if (
                    err instanceof ApiError &&
                    err.status === 404 &&
                    previousConversationId != null
                ) {
                    setChatError("Percakapan tidak ditemukan, memulai baru")
                    resetConversation()
                    data = await postChat({ query: userMessage })
                } else {
                    throw err
                }
            }
            if (data) {
                setActiveConversationId(data.conversation_id)
                const answer =
                    data.answer || "Maaf, saya tidak dapat menemukan jawaban."
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: answer,
                        confidence: data.confidence ?? null,
                        rag_iterations: data.iterations ?? null,
                        created_at: new Date().toISOString(),
                    },
                ])
                if (previousConversationId == null) {
                    const exists = conversations.some(
                        (c) => c.id === data?.conversation_id,
                    )
                    if (!exists) {
                        const item: ConversationSummary = {
                            id: data.conversation_id,
                            title: userMessage,
                            created_at: new Date().toISOString(),
                        }
                        setConversations((prev) => [item, ...prev])
                    }
                }
            }
        } catch (err) {
            let errorMessage = "Terjadi kesalahan saat memproses permintaan."
            if (err instanceof ApiError) {
                errorMessage = `Error: ${err.detail}`
            }
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: errorMessage, isError: true },
            ])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector(
                "[data-radix-scroll-area-viewport]",
            ) as HTMLElement | null
            if (viewport) viewport.scrollTop = viewport.scrollHeight
        }
    }, [messages, loading])

    return (
        <div className="min-h-[calc(100vh-64px)] w-full px-4 py-4">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 xl:grid-cols-[260px_1fr_260px]">
                <aside className="space-y-3">
                    <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle>History</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleNewChat}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Chat
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {historyError && (
                                <ErrorMessage
                                    message={historyError}
                                    onDismiss={() => setHistoryError(null)}
                                />
                            )}
                            {detailError && (
                                <ErrorMessage
                                    message={detailError}
                                    onDismiss={() => setDetailError(null)}
                                />
                            )}
                            {historyLoading && conversations.length === 0 ? (
                                <div className="flex items-center justify-center py-6">
                                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="rounded-md border border-dashed p-4 text-xs text-muted-foreground">
                                    Belum ada percakapan.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {conversations.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => loadDetail(c.id)}
                                            className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${activeConversationId === c.id ? "bg-primary/10 border-primary/20 text-primary" : "bg-background hover:bg-accent/50"}`}
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
                            {historyHasMore && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        loadHistory(historyOffset, true)
                                    }
                                    disabled={historyLoading}
                                    className="w-full"
                                >
                                    {historyLoading ? (
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Load More
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </aside>

                <div className="flex min-h-[calc(100vh-96px)] flex-col gap-3">
                    {chatError && (
                        <ErrorMessage
                            message={chatError}
                            onDismiss={() => setChatError(null)}
                        />
                    )}
                    <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                        <ScrollArea
                            className="min-h-0 flex-1 p-4"
                            ref={scrollRef}
                        >
                            <div className="space-y-6 pb-4">
                                {detailLoading && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Memuat percakapan...
                                    </div>
                                )}
                                {messages.length === 0 && !detailLoading && (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 mt-20 text-muted-foreground animate-in fade-in zoom-in duration-500">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                            <Bot className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 text-foreground">
                                            Humbet AI Assistant
                                        </h3>
                                        <p className="max-w-md text-sm">
                                            Silakan ajukan pertanyaan seputar
                                            Kelas Digital Huma Betang.
                                        </p>
                                    </div>
                                )}

                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                                            msg.role === "user"
                                                ? "justify-end"
                                                : "justify-start",
                                        )}
                                    >
                                        {msg.role === "assistant" && (
                                            <Avatar className="w-8 h-8 border">
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    AI
                                                </AvatarFallback>
                                                <AvatarImage src="/bot-avatar.png" />
                                            </Avatar>
                                        )}

                                        <div
                                            className={cn(
                                                "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                                msg.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                    : cn(
                                                          "bg-muted/50 border border-border rounded-tl-sm text-foreground",
                                                          msg.isError &&
                                                              "border-destructive/50 bg-destructive/10 text-destructive",
                                                      ),
                                            )}
                                        >
                                            {msg.role === "user" ? (
                                                <div className="whitespace-pre-wrap">
                                                    {msg.content}
                                                </div>
                                            ) : (
                                                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                                                    {idx ===
                                                        messages.length - 1 &&
                                                        thinkingEvents.length >
                                                            0 &&
                                                        !msg.isError && (
                                                            <div className="mb-3">
                                                                <InlineThinking
                                                                    events={
                                                                        thinkingEvents
                                                                    }
                                                                    isThinking={
                                                                        isThinking
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    <MarkdownText
                                                        content={msg.content}
                                                    />
                                                    {(msg.confidence != null ||
                                                        msg.rag_iterations !=
                                                            null) && (
                                                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                                            {msg.confidence !=
                                                                null && (
                                                                <span>
                                                                    Conf:{" "}
                                                                    {(
                                                                        msg.confidence *
                                                                        100
                                                                    ).toFixed(
                                                                        1,
                                                                    )}
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
                                            )}
                                        </div>

                                        {msg.role === "user" && (
                                            <Avatar className="w-8 h-8 border">
                                                <AvatarFallback className="bg-secondary text-secondary-foreground">
                                                    You
                                                </AvatarFallback>
                                                <User className="w-5 h-5" />
                                            </Avatar>
                                        )}
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex gap-4 w-full justify-start animate-in fade-in">
                                        <Avatar className="w-8 h-8 border">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                AI
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-4 py-4 max-w-[80%] flex items-center gap-2">
                                            <InlineThinking
                                                events={thinkingEvents}
                                                isThinking={isThinking}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <form
                                onSubmit={handleSubmit}
                                className="flex gap-2 relative"
                            >
                                <Textarea
                                    placeholder="Ketik pesan Anda..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    disabled={loading}
                                    className="pr-12 py-3 text-base shadow-sm resize-y min-h-20"
                                    rows={3}
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={loading || !query.trim()}
                                    className="absolute right-1 bottom-1 h-10 w-10 bg-primary hover:bg-primary/90 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                    <span className="sr-only">Kirim</span>
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>

                <aside className="space-y-3">
                    <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle>Dashboard</CardTitle>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={loadStats}
                                    disabled={statsLoading}
                                >
                                    {statsLoading ? (
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    Refresh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {statsError && (
                                <ErrorMessage
                                    message={statsError}
                                    onDismiss={() => setStatsError(null)}
                                />
                            )}
                            {!stats && statsLoading && (
                                <div className="flex items-center justify-center py-6">
                                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            {stats && (
                                <div className="grid gap-3 text-sm">
                                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                        <span>Total Conversations</span>
                                        <span className="font-mono font-semibold">
                                            {stats.total_conversations}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                        <span>Total Messages</span>
                                        <span className="font-mono font-semibold">
                                            {stats.total_messages}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                        <span>Average Confidence</span>
                                        <span className="font-mono font-semibold">
                                            {(
                                                stats.avg_confidence * 100
                                            ).toFixed(1)}
                                            %
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                        <span>Last Activity</span>
                                        <span className="font-mono text-xs">
                                            {formatDate(stats.last_activity)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    )
}
