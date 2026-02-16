import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import type { RAGEvent, RAGStage } from "@/api/logsStream"

type Props = {
    events: RAGEvent[]
    isThinking: boolean
}

const stagePalette: Record<
    RAGStage,
    { label: string; badge: string; border: string }
> = {
    rq_rag: { label: "Refinement", badge: "#3b82f6", border: "#93c5fd" },
    retrieval: { label: "Retrieval", badge: "#10b981", border: "#86efac" },
    reranker: { label: "Reranker", badge: "#f59e0b", border: "#fcd34d" },
    dragin: { label: "DRAGIN", badge: "#8b5cf6", border: "#c4b5fd" },
    generation: { label: "Generasi", badge: "#ef4444", border: "#fca5a5" },
    final_status: { label: "Final", badge: "#0ea5e9", border: "#7dd3fc" },
    log: { label: "Log", badge: "#6b7280", border: "#d1d5db" },
}

export default function InlineThinking({ events, isThinking }: Props) {
    const [manualOpen, setManualOpen] = useState<boolean | null>(null)
    const [tick, setTick] = useState(0)
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isThinking) return
        let step = 0
        const id = setInterval(() => {
            step = (step + 1) % 4
            setTick(step)
        }, 400)
        return () => clearInterval(id)
    }, [isThinking])

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [events.length])

    const headerText = useMemo(
        () => (isThinking ? "Thinking..." : "Thinking"),
        [isThinking],
    )
    const open = isThinking
        ? true
        : (manualOpen ?? (events.length > 0 ? false : true))
    const dots = isThinking ? "•".repeat(tick) : ""

    return (
        <div
            style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: 14,
                background: "hsl(var(--background))",
                width: "100%",
                overflow: "hidden",
            }}
        >
            <style>{`@keyframes inlineThinkingFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <button
                type="button"
                onClick={() => setManualOpen(!open)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "10px 12px",
                    background: "hsl(var(--muted))",
                    color: "hsl(var(--foreground))",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                }}
            >
                <span>{headerText}</span>
                <ChevronDown
                    size={14}
                    style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 150ms ease",
                    }}
                />
            </button>
            {open && (
                <div
                    style={{
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        maxHeight: 240,
                        overflowY: "auto",
                    }}
                >
                    {events.map((e, idx) => {
                        const stageKey = (e.stage ?? "log") as string
                        const palette =
                            stagePalette[stageKey as RAGStage] ??
                            stagePalette.log
                        const label =
                            stagePalette[stageKey as RAGStage]?.label ??
                            stageKey
                        const content = e.rawText ?? e.summary ?? e.action ?? ""
                        return (
                            <div
                                key={`${stageKey}-${idx}`}
                                style={{
                                    borderLeft: `3px solid ${palette.border}`,
                                    paddingLeft: 10,
                                    animation:
                                        "inlineThinkingFade 160ms ease-out",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 8,
                                        fontSize: 11,
                                        color: "hsl(var(--muted-foreground))",
                                        marginBottom: 4,
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            padding: "2px 8px",
                                            borderRadius: 999,
                                            background: `${palette.badge}20`,
                                            color: palette.badge,
                                            border: `1px solid ${palette.badge}40`,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {label}
                                    </span>
                                    <span>{e.time ?? ""}</span>
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "hsl(var(--foreground))",
                                        whiteSpace: "pre-wrap",
                                        fontFamily: e.rawText
                                            ? "var(--font-mono)"
                                            : "inherit",
                                    }}
                                >
                                    {content}
                                </div>
                                {e.details && (
                                    <div
                                        style={{
                                            marginTop: 6,
                                            display: "grid",
                                            gap: 4,
                                            fontSize: 11,
                                        }}
                                    >
                                        {Object.entries(e.details).map(
                                            ([k, v]) => (
                                                <div
                                                    key={`${idx}-${k}`}
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        gap: 10,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: "hsl(var(--muted-foreground))",
                                                        }}
                                                    >
                                                        {k}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontFamily:
                                                                "var(--font-mono)",
                                                        }}
                                                    >
                                                        {typeof v === "string"
                                                            ? v
                                                            : JSON.stringify(v)}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {isThinking && (
                        <div
                            style={{
                                fontSize: 12,
                                color: "hsl(var(--muted-foreground))",
                                fontFamily: "var(--font-mono)",
                                minHeight: 16,
                            }}
                        >
                            {dots}
                        </div>
                    )}
                    <div ref={endRef} />
                </div>
            )}
        </div>
    )
}
