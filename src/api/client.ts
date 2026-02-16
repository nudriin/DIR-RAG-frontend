import type {
    ChatRequest,
    ChatResponse,
    ConversationDetail,
    ConversationSummary,
    DashboardStats,
    EvaluateRequest,
    EvaluateResponse,
    FeedbackRequest,
    FeedbackResponse,
    IngestResponse,
    VectorResetResponse,
    VectorDeleteResponse,
    VectorSourcesResponse,
    VectorSourceDetailResponse,
} from "../types/api"

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

// ─── Generic Helpers ─────────────────────────────────────────────────────────

export class ApiError extends Error {
    status: number
    statusText: string
    detail: string

    constructor(status: number, statusText: string, detail: string) {
        super(`${status} ${statusText}: ${detail}`)
        this.name = "ApiError"
        this.status = status
        this.statusText = statusText
        this.detail = detail
    }
}

async function fetchJson<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const url = `${BASE_URL}${endpoint}`
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    })

    if (!res.ok) {
        let detail = res.statusText
        try {
            const body = await res.json()
            detail = body.detail ?? JSON.stringify(body)
        } catch {
            /* use statusText */
        }
        throw new ApiError(res.status, res.statusText, detail)
    }

    return res.json() as Promise<T>
}

async function uploadFile<T>(endpoint: string, file: File): Promise<T> {
    const url = `${BASE_URL}${endpoint}`
    const form = new FormData()
    form.append("file", file)

    const res = await fetch(url, { method: "POST", body: form })

    if (!res.ok) {
        let detail = res.statusText
        try {
            const body = await res.json()
            detail = body.detail ?? JSON.stringify(body)
        } catch {
            /* use statusText */
        }
        throw new ApiError(res.status, res.statusText, detail)
    }

    return res.json() as Promise<T>
}

function downloadJson(data: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}

async function fetchNoContent(
    endpoint: string,
    options: RequestInit = {},
): Promise<void> {
    const url = `${BASE_URL}${endpoint}`
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    })

    if (!res.ok) {
        let detail = res.statusText
        try {
            const body = await res.json()
            detail = body.detail ?? JSON.stringify(body)
        } catch {
            /* use statusText */
        }
        throw new ApiError(res.status, res.statusText, detail)
    }
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export function postChat(params: {
    query: string
    conversationId?: number | null
}): Promise<ChatResponse> {
    const body: ChatRequest = {
        query: params.query,
        ...(params.conversationId != null
            ? { conversation_id: params.conversationId }
            : {}),
    }
    return fetchJson<ChatResponse>("/chat", {
        method: "POST",
        body: JSON.stringify(body),
    })
}

export function getHistory(params: {
    offset: number
    limit: number
}): Promise<ConversationSummary[]> {
    const query = new URLSearchParams({
        offset: String(params.offset),
        limit: String(params.limit),
    })
    return fetchJson<ConversationSummary[]>(`/history?${query}`, {
        method: "GET",
    })
}

export function getConversationDetail(id: number): Promise<ConversationDetail> {
    return fetchJson<ConversationDetail>(`/history/${id}`, { method: "GET" })
}

export function getDashboardStats(): Promise<DashboardStats> {
    return fetchJson<DashboardStats>("/dashboard/stats", { method: "GET" })
}

export function submitFeedback(params: {
    messageId: number
    score: number
    comment?: string | null
}): Promise<FeedbackResponse> {
    const body: FeedbackRequest = {
        message_id: params.messageId,
        score: params.score,
        comment: params.comment ?? null,
    }
    return fetchJson<FeedbackResponse>("/feedback", {
        method: "POST",
        body: JSON.stringify(body),
    })
}

export async function exportAllConversations(): Promise<void> {
    const res = await fetch(`${BASE_URL}/export`, { method: "GET" })
    if (!res.ok) {
        let detail = res.statusText
        try {
            const body = await res.json()
            detail = body.detail ?? JSON.stringify(body)
        } catch {
            /* use statusText */
        }
        throw new ApiError(res.status, res.statusText, detail)
    }
    const data = await res.json()
    const date = new Date().toISOString().slice(0, 10)
    downloadJson(data, `conversation_export_all_${date}.json`)
}

export function deleteConversationHistory(id: number): Promise<void> {
    return fetchNoContent(`/history/${id}`, { method: "DELETE" })
}

export function deleteAllHistory(): Promise<void> {
    return fetchNoContent("/history", { method: "DELETE" })
}

export async function exportConversation(
    conversationId: number,
): Promise<void> {
    const res = await fetch(
        `${BASE_URL}/export?conversation_id=${conversationId}`,
        { method: "GET" },
    )
    if (!res.ok) {
        let detail = res.statusText
        try {
            const body = await res.json()
            detail = body.detail ?? JSON.stringify(body)
        } catch {
            /* use statusText */
        }
        throw new ApiError(res.status, res.statusText, detail)
    }
    const data = await res.json()
    downloadJson(data, `conversation_export_${conversationId}.json`)
}

// ─── Evaluate ────────────────────────────────────────────────────────────────

export function postEvaluate(data: EvaluateRequest): Promise<EvaluateResponse> {
    return fetchJson<EvaluateResponse>("/evaluate", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

// ─── Ingest ──────────────────────────────────────────────────────────────────

export function postIngest(file: File): Promise<IngestResponse> {
    return uploadFile<IngestResponse>("/ingest", file)
}

// ─── Vectors ─────────────────────────────────────────────────────────────────

export function postVectorsReset(): Promise<VectorResetResponse> {
    return fetchJson<VectorResetResponse>("/vectors/reset", { method: "POST" })
}

export function postVectorsDeleteBySource(
    source: string,
): Promise<VectorDeleteResponse> {
    return fetchJson<VectorDeleteResponse>("/vectors/delete-by-source", {
        method: "POST",
        body: JSON.stringify({ source }),
    })
}

export function getVectorsSources(): Promise<VectorSourcesResponse> {
    return fetchJson<VectorSourcesResponse>("/vectors/sources", {
        method: "GET",
    })
}

export function getVectorsSourceDetail(
    source: string,
): Promise<VectorSourceDetailResponse> {
    return fetchJson<VectorSourceDetailResponse>(
        `/vectors/source-detail?source=${encodeURIComponent(source)}`,
        { method: "GET" },
    )
}
