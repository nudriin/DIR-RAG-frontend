import { useState, useRef, useEffect } from "react"
import { Send, Bot, User } from "lucide-react"
import { postChat, ApiError } from "../api/client"
import type { ChatResponse, Role } from "../types/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MarkdownText from "../components/MarkdownText"
import ErrorMessage from "../components/ErrorMessage"
import { cn } from "@/lib/utils"
import InlineThinking from "@/components/InlineThinking"
import useThinkingStream from "@/hooks/useThinkingStream"
import { useConversation } from "@/context/conversation-store"
import { ROLE_CHIPS, roleValueToLabel } from "@/utils/roles"

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
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)

    const scrollRef = useRef<HTMLDivElement>(null)
    const {
        events: thinkingEvents,
        isThinking,
        startListening,
        reset,
    } = useThinkingStream()
    const { activeConversationId, setActiveConversationId, resetConversation } =
        useConversation()
    useEffect(() => {
        return () => {
            resetConversation()
        }
    }, [resetConversation])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim() || loading || !selectedRole) return

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
                    userRole: selectedRole,
                    targetRole: null,
                })
            } catch (err) {
                if (
                    err instanceof ApiError &&
                    err.status === 404 &&
                    previousConversationId != null
                ) {
                    setChatError("Percakapan tidak ditemukan, memulai baru")
                    resetConversation()
                    data = await postChat({
                        query: userMessage,
                        userRole: selectedRole,
                        targetRole: null,
                    })
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
        <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto w-full p-4">
            {chatError && (
                <ErrorMessage
                    message={chatError}
                    onDismiss={() => setChatError(null)}
                />
            )}
            <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                {selectedRole && (
                    <div className="flex justify-end px-4 py-2 border-b bg-muted/20">
                        <div className="rounded-full bg-background border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            Peran: <span className="text-primary">{roleValueToLabel(selectedRole)}</span>
                        </div>
                    </div>
                )}
                <ScrollArea className="min-h-0 flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-6 pb-4">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 mt-20 text-muted-foreground animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Bot className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-foreground">
                                    Humbet AI Assistant
                                </h3>
                                <p className="max-w-md text-sm">
                                    Silakan ajukan pertanyaan seputar Kelas
                                    Digital Huma Betang.
                                </p>
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <div className="mx-auto grid grid-cols-2 gap-2 sm:grid-cols-6 max-w-md sm:max-w-xl">
                                        {ROLE_CHIPS.map((opt, i) => {
                                            const active =
                                                selectedRole === opt.value
                                            const pos =
                                                i === 0
                                                    ? "sm:col-span-2 sm:col-start-1"
                                                    : i === 1
                                                      ? "sm:col-span-2 sm:col-start-3"
                                                      : i === 2
                                                        ? "sm:col-span-2 sm:col-start-5"
                                                        : i === 3
                                                          ? "sm:col-span-2 sm:col-start-2"
                                                          : "sm:col-span-2 sm:col-start-4"
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedRole(
                                                            opt.value,
                                                        )
                                                    }
                                                    className={`w-full text-center rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:shadow-sm ${
                                                        active
                                                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                                                            : "border-border bg-background text-foreground"
                                                    } ${pos}`}
                                                    aria-pressed={active}
                                                >
                                                    {opt.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    {!selectedRole && (
                                        <p className="text-xs text-muted-foreground">
                                            Pilih peran Anda terlebih dahulu.
                                        </p>
                                    )}
                                </div>
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
                                            {idx === messages.length - 1 &&
                                                thinkingEvents.length > 0 &&
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
                                                msg.rag_iterations != null) && (
                                                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                                    {msg.confidence != null && (
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
                                                            {msg.rag_iterations}
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
                            disabled={loading || !selectedRole}
                            className="pr-12 py-3 text-base shadow-sm resize-y min-h-20"
                            rows={3}
                            autoFocus
                        />

                        <Button
                            type="submit"
                            size="icon"
                            disabled={loading || !query.trim() || !selectedRole}
                            className="absolute right-1 bottom-1 h-10 w-10 bg-primary hover:bg-primary/90 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            <span className="sr-only">Kirim</span>
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}
