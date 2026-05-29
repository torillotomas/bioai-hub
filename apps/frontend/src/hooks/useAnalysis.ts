import { useState } from "react";
import { analyzeImage } from "../services/analysisApi";
import type { AnalysisResponse } from "../types/analysis";

type Status = "idle" | "uploading" | "analyzing" | "done" | "error";

export function useAnalysis() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze(file: File, patientId: string, studyType: string) {
    setStatus("uploading");
    setError(null);
    setResult(null);

    try {
      setStatus("analyzing");
      const data = await analyzeImage(file, patientId, studyType);
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  return { status, result, error, analyze, reset };
}
