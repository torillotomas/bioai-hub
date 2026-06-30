import axios from "axios";
import { apiClient } from "./apiClient";
import type { AnalysisResponse, AnalysisErrorResponse } from "../types/analysis";

export async function fetchHistory(): Promise<AnalysisResponse[]> {
  try {
    const { data } = await apiClient.get<AnalysisResponse[]>("/api/v1/analysis");
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const data = err.response.data as AnalysisErrorResponse;
      throw new Error(data.error ?? "Error al cargar el historial");
    }
    throw new Error("No se pudo conectar con el servidor");
  }
}

export async function analyzeImage(
  file: File,
  patientId: string,
  studyType: string,
  notes?: string
): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append(
    "metadata",
    JSON.stringify({ patientId, studyType, notes, uploadedAt: new Date().toISOString() })
  );

  try {
    const { data } = await apiClient.post<AnalysisResponse>("/api/v1/analysis", form);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const data = err.response.data as AnalysisErrorResponse;
      throw new Error(data.error ?? "Error desconocido del servidor");
    }
    throw new Error("No se pudo conectar con el servidor");
  }
}
