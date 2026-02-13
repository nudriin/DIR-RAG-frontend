import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { postChat, ApiError } from "../api/client"
import type { ChatResponse } from "../types/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MarkdownText from "../components/MarkdownText"
import { cn } from "@/lib/utils"

interface Message {
    role: "user" | "assistant"
    content: string
    isError?: boolean
}

export default function ConversationPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim() || loading) return

        const userMessage = query.trim()
        setQuery("")
        setMessages((prev) => [...prev, { role: "user", content: userMessage }])
        setLoading(true)

        try {
            const data: ChatResponse = await postChat(userMessage)
            const answer =
                data.answer || "Maaf, saya tidak dapat menemukan jawaban."
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: answer },
            ])
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
            <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
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
                                            <MarkdownText
                                                content={msg.content}
                                            />
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
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    <span className="text-muted-foreground text-xs font-medium">
                                        Thinking...
                                    </span>
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
    )
}
