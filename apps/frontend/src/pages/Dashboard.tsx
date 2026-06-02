import { useState } from "react";
import { DropZone } from "../components/upload/DropZone";
import { FilePreview } from "../components/upload/FilePreview";
import { DiagnosisCard } from "../components/analysis/DiagnosisCard";
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { HistoryPanel } from "../components/history/HistoryPanel";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAuth } from "../context/AuthContext";
import type { AnalysisResponse } from "../types/analysis";

const STUDY_TYPES = [
  { value: "chest_xray", label: "Radiografía de tórax" },
  { value: "mri",        label: "Resonancia magnética" },
  { value: "ct",         label: "Tomografía computada" },
];

export function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [patientId, setPatientId] = useState("");
  const [studyType, setStudyType] = useState("chest_xray");
  const { status, result, error, analyze, reset, loadFromHistory } = useAnalysis();
  const { user, logout } = useAuth();

  const isLoading = status === "uploading" || status === "analyzing";

  function handleFile(f: File) { setFile(f); reset(); }
  function handleRemove() { setFile(null); reset(); }
  function handleReset() { setFile(null); reset(); setPatientId(""); setStudyType("chest_xray"); }

  function handleHistorySelect(item: AnalysisResponse) {
    setFile(null);
    loadFromHistory(item);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !patientId) return;
    await analyze(file, patientId, studyType);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">BioAI Hub</h1>
              <p className="text-xs text-gray-400">Medical Image Analysis Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={() => void logout()}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-2.5 rounded-lg hover:bg-gray-100 min-h-[44px]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col sm:flex-row gap-6 items-start">

        {/* Panel de historial */}
        <HistoryPanel onSelect={handleHistorySelect} />

        {/* Contenido principal */}
        <div className="flex-1 space-y-6">

          {status === "done" && result && (
            <DiagnosisCard data={result} onReset={handleReset} />
          )}

          {status === "error" && error && (
            <ErrorBanner message={error} onDismiss={reset} />
          )}

          {isLoading && <LoadingSkeleton />}

          {status !== "done" && (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-800">Nuevo análisis</h2>

              {file ? (
                <FilePreview file={file} onRemove={handleRemove} />
              ) : (
                <DropZone onFile={handleFile} disabled={isLoading} />
              )}

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID del paciente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Ej: PAC-00123"
                    disabled={isLoading}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de estudio
                  </label>
                  <select
                    value={studyType}
                    onChange={(e) => setStudyType(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 min-h-[44px]"
                  >
                    {STUDY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || !patientId || isLoading}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm min-h-[44px]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Analizando...
                  </span>
                ) : (
                  "Analizar imagen"
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
