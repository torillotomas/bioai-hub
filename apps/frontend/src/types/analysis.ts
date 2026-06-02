// Contrato de tipos compartido entre frontend y backend.
// Estos tipos reflejan exactamente los DTOs del servidor — no modificar
// sin sincronizar con apps/backend/src/analysis/dto/.

export type StudyType = "chest_xray" | "mri" | "ct";

export interface AnalysisMetadata {
  patientId: string;
  studyType: StudyType;
  notes?: string;
  uploadedAt: string; // ISO 8601
}

export interface ClassScores {
  [key: string]: number;
}

export interface AnalysisResult {
  prediction: string;
  confidence: number;
  class_scores: ClassScores;
  model_version: string;
  inference_time_ms: number;
  heatmap_b64?: string;
}

export interface AnalysisAudit {
  processed_at: string;
  node_version: string;
  image_hash_sha256: string;
}

export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

export interface AnalysisResponse {
  analysis_id: string;
  status: AnalysisStatus;
  result: AnalysisResult;
  audit: AnalysisAudit;
}

export interface AnalysisErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}
