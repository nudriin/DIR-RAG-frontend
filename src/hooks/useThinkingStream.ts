import { useCallback, useEffect, useRef, useState } from "react"
import { LogsStreamClient, type RAGEvent } from "@/api/logsStream"

const MAX_EVENTS = 500

export default function useThinkingStream() {
    const [events, setEvents] = useState<RAGEvent[]>([])
    const [isThinking, setIsThinking] = useState(false)
    const clientRef = useRef<LogsStreamClient | null>(null)

    const close = useCallback(() => {
        clientRef.current?.close()
        clientRef.current = null
        setIsThinking(false)
    }, [])

    const startListening = useCallback(() => {
        close()
        setEvents([])
        const client = new LogsStreamClient()
        clientRef.current = client
        setIsThinking(true)
        return new Promise<void>((resolve) => {
            let resolved = false
            const timer = setTimeout(() => {
                if (!resolved) {
                    resolved = true
                    resolve()
                }
            }, 400)
            client.connect(
                (e) => {
                    setEvents((prev) => {
                        const next = [...prev, e]
                        if (next.length > MAX_EVENTS) next.shift()
                        return next
                    })
                    if (e.stage === "final_status") {
                        client.close()
                        clientRef.current = null
                        setIsThinking(false)
                    }
                },
                () => {
                    setIsThinking(false)
                },
                () => {
                    if (!resolved) {
                        resolved = true
                        clearTimeout(timer)
                        resolve()
                    }
                },
            )
        })
    }, [close])

    const reset = useCallback(() => {
        close()
        setEvents([])
    }, [close])

    useEffect(() => {
        return () => {
            close()
        }
    }, [close])

    return { events, isThinking, startListening, reset }
}
