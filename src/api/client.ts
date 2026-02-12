import type {
  ChatRequest,
  ChatResponse,
  EvaluateRequest,
  EvaluateResponse,
  IngestResponse,
  VectorResetResponse,
  VectorDeleteResponse,
  VectorSourcesResponse,
  VectorSourceDetailResponse,
} from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// ─── Generic Helpers ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  statusText: string;
  detail: string;

  constructor(status: number, statusText: string, detail: string) {
    super(`${status} ${statusText}: ${detail}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.detail = detail;
  }
}

async function fetchJson<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? JSON.stringify(body);
    } catch {
      /* use statusText */
    }
    throw new ApiError(res.status, res.statusText, detail);
  }

  return res.json() as Promise<T>;
}

async function uploadFile<T>(endpoint: string, file: File): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(url, { method: 'POST', body: form });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? JSON.stringify(body);
    } catch {
      /* use statusText */
    }
    throw new ApiError(res.status, res.statusText, detail);
  }

  return res.json() as Promise<T>;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export function postChat(query: string): Promise<ChatResponse> {
  const body: ChatRequest = { query };
  return fetchJson<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ─── Evaluate ────────────────────────────────────────────────────────────────

export function postEvaluate(data: EvaluateRequest): Promise<EvaluateResponse> {
  return fetchJson<EvaluateResponse>('/evaluate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Ingest ──────────────────────────────────────────────────────────────────

export function postIngest(file: File): Promise<IngestResponse> {
  return uploadFile<IngestResponse>('/ingest', file);
}

// ─── Vectors ─────────────────────────────────────────────────────────────────

export function postVectorsReset(): Promise<VectorResetResponse> {
  return fetchJson<VectorResetResponse>('/vectors/reset', { method: 'POST' });
}

export function postVectorsDeleteBySource(
  source: string,
): Promise<VectorDeleteResponse> {
  return fetchJson<VectorDeleteResponse>('/vectors/delete-by-source', {
    method: 'POST',
    body: JSON.stringify({ source }),
  });
}

export function getVectorsSources(): Promise<VectorSourcesResponse> {
  return fetchJson<VectorSourcesResponse>('/vectors/sources', { method: 'GET' });
}

export function getVectorsSourceDetail(
  source: string,
): Promise<VectorSourceDetailResponse> {
  return fetchJson<VectorSourceDetailResponse>(
    `/vectors/source-detail?source=${encodeURIComponent(source)}`,
    { method: 'GET' },
  );
}
