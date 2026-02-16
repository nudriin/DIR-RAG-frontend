import type {
    AdminRegisterRequest,
    AdminRegisterResponse,
    AuthUser,
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
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RefreshResponse,
    VectorResetResponse,
    VectorDeleteResponse,
    VectorSourcesResponse,
    VectorSourceDetailResponse,
} from "../types/api"
import { clearAuth, loadAuth, saveAuth } from "../auth/storage"

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

async function fetchAuthJson<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const res = await authorizedFetch(endpoint, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    })
    return res.json() as Promise<T>
}

async function uploadAuthFile<T>(endpoint: string, file: File): Promise<T> {
    const form = new FormData()
    form.append("file", file)
    const res = await authorizedFetch(endpoint, { method: "POST", body: form })
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

async function fetchAuthNoContent(
    endpoint: string,
    options: RequestInit = {},
): Promise<void> {
    await authorizedFetch(endpoint, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    })
}

async function parseErrorDetail(res: Response) {
    let detail = res.statusText
    try {
        const body = await res.json()
        detail = body.detail ?? JSON.stringify(body)
    } catch {
        detail = res.statusText
    }
    return detail
}

async function authorizedFetch(
    endpoint: string,
    options: RequestInit = {},
    allowRefresh = true,
): Promise<Response> {
    const url = `${BASE_URL}${endpoint}`
    const { accessToken, refreshToken, user } = loadAuth()
    const headers = new Headers(options.headers)
    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`)
    }
    const res = await fetch(url, { ...options, headers })
    if (res.status === 401 && allowRefresh) {
        if (!refreshToken) {
            clearAuth()
            window.dispatchEvent(
                new CustomEvent("auth:expired", {
                    detail: { message: "Sesi berakhir, silakan login lagi" },
                }),
            )
            const detail = await parseErrorDetail(res)
            throw new ApiError(res.status, res.statusText, detail)
        }
        try {
            const refreshed = await postRefresh({
                refresh_token: refreshToken,
            })
            const nextUser: AuthUser | null = refreshed.user ?? user ?? null
            saveAuth({
                accessToken: refreshed.access_token,
                refreshToken: refreshed.refresh_token,
                user: nextUser,
            })
            window.dispatchEvent(new Event("auth:updated"))
            return authorizedFetch(endpoint, options, false)
        } catch (err) {
            clearAuth()
            window.dispatchEvent(
                new CustomEvent("auth:expired", {
                    detail: { message: "Sesi berakhir, silakan login lagi" },
                }),
            )
            if (err instanceof ApiError) {
                throw err
            }
            const detail = await parseErrorDetail(res)
            throw new ApiError(res.status, res.statusText, detail)
        }
    }
    if (!res.ok) {
        const detail = await parseErrorDetail(res)
        throw new ApiError(res.status, res.statusText, detail)
    }
    return res
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
    return fetchAuthJson<ConversationSummary[]>(`/history?${query}`, {
        method: "GET",
    })
}

export function getConversationDetail(id: number): Promise<ConversationDetail> {
    return fetchAuthJson<ConversationDetail>(`/history/${id}`, {
        method: "GET",
    })
}

export function getDashboardStats(): Promise<DashboardStats> {
    return fetchAuthJson<DashboardStats>("/dashboard/stats", { method: "GET" })
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
    const res = await authorizedFetch("/export", { method: "GET" })
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
    return fetchAuthNoContent(`/history/${id}`, { method: "DELETE" })
}

export function deleteAllHistory(): Promise<void> {
    return fetchAuthNoContent("/history", { method: "DELETE" })
}

export async function exportConversation(
    conversationId: number,
): Promise<void> {
    const res = await authorizedFetch(
        `/export?conversation_id=${conversationId}`,
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
    return fetchAuthJson<EvaluateResponse>("/evaluate", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

// ─── Ingest ──────────────────────────────────────────────────────────────────

export function postIngest(file: File): Promise<IngestResponse> {
    return uploadAuthFile<IngestResponse>("/ingest", file)
}

export function postLogin(data: LoginRequest): Promise<LoginResponse> {
    return fetchJson<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export function postRefresh(data: RefreshRequest): Promise<RefreshResponse> {
    return fetchJson<RefreshResponse>("/refresh", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export function postAdminRegister(
    data: AdminRegisterRequest,
): Promise<AdminRegisterResponse> {
    return fetchAuthJson<AdminRegisterResponse>("/admin/register", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

// ─── Vectors ─────────────────────────────────────────────────────────────────

export function postVectorsReset(): Promise<VectorResetResponse> {
    return fetchAuthJson<VectorResetResponse>("/vectors/reset", {
        method: "POST",
    })
}

export function postVectorsDeleteBySource(
    source: string,
): Promise<VectorDeleteResponse> {
    return fetchAuthJson<VectorDeleteResponse>("/vectors/delete-by-source", {
        method: "POST",
        body: JSON.stringify({ source }),
    })
}

export function getVectorsSources(): Promise<VectorSourcesResponse> {
    return fetchAuthJson<VectorSourcesResponse>("/vectors/sources", {
        method: "GET",
    })
}

export function getVectorsSourceDetail(
    source: string,
): Promise<VectorSourceDetailResponse> {
    return fetchAuthJson<VectorSourceDetailResponse>(
        `/vectors/source-detail?source=${encodeURIComponent(source)}`,
        { method: "GET" },
    )
}
