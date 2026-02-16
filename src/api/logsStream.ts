export type RAGStage =
    | "rq_rag"
    | "retrieval"
    | "reranker"
    | "dragin"
    | "generation"
    | "final_status"
    | "log"

export interface RAGEvent {
    time?: string
    stage?: RAGStage
    action?: string
    summary?: string
    details?: Record<string, unknown>
    rawText?: string
}

export function normalizeEvent(data: string): RAGEvent {
    try {
        const obj = JSON.parse(data)
        return {
            time: obj.time,
            stage: obj.stage,
            action: obj.action,
            summary: obj.summary,
            details: obj.details,
        }
    } catch {
        return {
            stage: "log",
            rawText: data,
            time: new Date().toISOString(),
        }
    }
}

type MessageHandler = (e: RAGEvent) => void
type ErrorHandler = (e: Event) => void
type OpenHandler = () => void

export class LogsStreamClient {
    private url: string
    private es?: EventSource
    private messageHandlers = new Set<MessageHandler>()
    private errorHandlers = new Set<ErrorHandler>()
    private openHandlers = new Set<OpenHandler>()
    private retries = 0
    private backoffMs = [2000, 5000, 10000, 10000, 10000]
    public connected = false

    constructor(baseUrl?: string) {
        const apiBase = baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? "/api"
        this.url = `${apiBase}/logs/stream`
    }

    connect(onEvent?: MessageHandler, onError?: ErrorHandler, onOpen?: OpenHandler) {
        if (this.es) return
        if (onEvent) this.messageHandlers.add(onEvent)
        if (onError) this.errorHandlers.add(onError)
        if (onOpen) this.openHandlers.add(onOpen)
        this.connected = false
        this.es = new EventSource(this.url)
        this.es.onopen = () => {
            this.connected = true
            this.openHandlers.forEach((h) => h())
        }
        this.es.onmessage = (ev) => {
            const raw = (ev.data ?? "").trim()
            if (!raw || raw === "ping" || raw === ":ping" || raw === ": ping")
                return
            const e = normalizeEvent(raw)
            this.messageHandlers.forEach((h) => h(e))
        }
        this.es.onerror = (ev) => {
            this.connected = false
            this.errorHandlers.forEach((h) => h(ev))
            this.scheduleReconnect()
        }
    }

    disconnect() {
        if (this.es) {
            this.es.close()
            this.es = undefined
        }
        this.retries = 0
        this.connected = false
    }

    close() {
        this.disconnect()
    }

    onMessage(handler: MessageHandler) {
        this.messageHandlers.add(handler)
        return () => this.messageHandlers.delete(handler)
    }

    onError(handler: ErrorHandler) {
        this.errorHandlers.add(handler)
        return () => this.errorHandlers.delete(handler)
    }

    private scheduleReconnect() {
        if (this.retries >= this.backoffMs.length) {
            this.disconnect()
            return
        }
        const delay = this.backoffMs[this.retries]
        this.retries += 1
        this.disconnect()
        setTimeout(() => this.connect(), delay)
    }
}
