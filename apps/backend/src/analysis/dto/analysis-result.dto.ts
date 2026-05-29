export interface ClassScores {
  NORMAL: number;
  PNEUMONIA: number;
  [label: string]: number;
}

export interface AnalysisResult {
  prediction: string;
  confidence: number;
  class_scores: ClassScores;
  model_version: string;
  inference_time_ms: number;
}

export interface AnalysisResponseDto {
  analysis_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result: AnalysisResult;
  audit: {
    processed_at: string;
    node_version: string;
    image_hash_sha256: string;
  };
}
