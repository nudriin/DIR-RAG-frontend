/* ========================================================================
   Humbet AI Chatbot — API Type Definitions
   All interfaces match the backend contract exactly.
   ======================================================================== */

// ─── Chat ────────────────────────────────────────────────────────────────────

export interface ChatRequest {
  query: string;
}

export interface Source {
  id: number;
  source?: string;
  chunk_id?: string;
}

export interface TraceEntry {
  iteration: number;
  refined_query: string;
  num_documents: number;
  retrieve: boolean;
  retrieval_confidence: number;
  reason: string;
  raw_query?: string;
}

export interface DebugRqRag {
  refined_query: string;
  sub_queries: string[];
  docs_retrieved: number;
  source_names: string[];
}

export interface DebugDRAGIN {
  entropy: number;
  triggered_retrieval: boolean;
  reason: string;
}

export interface DebugIterRetgen {
  iter_query: string;
  current_draft: string;
  new_docs_found: number;
  pruning_discarded: number;
  pruning_kept: number;
  executing: string;
}

export interface DebugEtc {
  current_trend: string;
}

export interface DebugIteration {
  step: number;
  dragin?: DebugDRAGIN;
  iter_retgen: DebugIterRetgen;
  etc: DebugEtc;
}

export interface DebugFinalStatus {
  stop_reason: string;
  is_fallback: boolean;
  entropy_history: number[];
}

export interface DebugLogs {
  rq_rag: DebugRqRag;
  iterations: DebugIteration[];
  final_status: DebugFinalStatus;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  iterations: number;
  confidence: number;
  trace: TraceEntry[];
  debug_logs: DebugLogs;
}

// ─── Evaluate ────────────────────────────────────────────────────────────────

export interface EvaluateRequest {
  questions: string[];
  ground_truth_answers?: string[];
  relevant_doc_ids?: string[][];
}

export interface EvaluateResponse {
  hit_rate: number;
  mrr: number;
  ragas: Record<string, number>;
}

// ─── Ingest ──────────────────────────────────────────────────────────────────

export interface IngestResponse {
  source: string;
  num_chunks: number;
}

// ─── Vectors ─────────────────────────────────────────────────────────────────

export interface VectorResetResponse {
  success: boolean;
}

export interface VectorDeleteRequest {
  source: string;
}

export interface VectorDeleteResponse {
  source: string;
  deleted_count: number;
}

export interface VectorSourceEntry {
  source: string;
  num_chunks: number;
}

export interface VectorSourcesResponse {
  sources: VectorSourceEntry[];
}

export interface ChunkEntry {
  doc_id: string;
  chunk_id?: string;
  content: string;
}

export interface VectorSourceDetailResponse {
  source: string;
  num_chunks: number;
  chunks: ChunkEntry[];
}
