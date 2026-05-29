import { useState } from "react";
import { DropZone } from "../components/upload/DropZone";
import { FilePreview } from "../components/upload/FilePreview";
import { DiagnosisCard } from "../components/analysis/DiagnosisCard";
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { useAnalysis } from "../hooks/useAnalysis";

const STUDY_TYPES = [
  { value: "chest_xray", label: "Radiografía de tórax" },
  { value: "mri",        label: "Resonancia magnética" },
  { value: "ct",         label: "Tomografía computada" },
];

export function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [patientId, setPatientId] = useState("");
  const [studyType, setStudyType] = useState("chest_xray");
  const { status, result, error, analyze, reset } = useAnalysis();

  const isLoading = status === "uploading" || status === "analyzing";

  function handleFile(f: File) {
    setFile(f);
    reset();
  }

  function handleRemove() {
    setFile(null);
    reset();
  }

  function handleReset() {
    setFile(null);
    reset();
    setPatientId("");
    setStudyType("chest_xray");
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
        <div className="max-w-3xl mx-auto flex items-center gap-3">
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
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Resultado */}
        {status === "done" && result && (
          <DiagnosisCard data={result} onReset={handleReset} />
        )}

        {/* Error */}
        {status === "error" && error && (
          <ErrorBanner message={error} onDismiss={reset} />
        )}

        {/* Skeleton de carga */}
        {isLoading && <LoadingSkeleton />}

        {/* Formulario — se oculta cuando hay resultado */}
        {status !== "done" && (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-gray-800">Nueva análisis</h2>

            {/* Drop zone o preview */}
            {file ? (
              <FilePreview file={file} onRemove={handleRemove} />
            ) : (
              <DropZone onFile={handleFile} disabled={isLoading} />
            )}

            {/* Datos del paciente */}
            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50"
                >
                  {STUDY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={!file || !patientId || isLoading}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
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
      </main>
    </div>
  );
}
