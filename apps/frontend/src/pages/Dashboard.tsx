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

const INPUT_CLS =
  "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:opacity-40 disabled:bg-gray-50 transition-all duration-150";

export function Dashboard() {
  const [file, setFile]           = useState<File | null>(null);
  const [patientId, setPatientId] = useState("");
  const [studyType, setStudyType] = useState("chest_xray");
  const { status, result, error, analyze, reset, loadFromHistory } = useAnalysis();
  const { user, logout } = useAuth();

  const isLoading = status === "uploading" || status === "analyzing";

  function handleFile(f: File)  { setFile(f); reset(); }
  function handleRemove()       { setFile(null); reset(); }
  function handleReset()        { setFile(null); reset(); setPatientId(""); setStudyType("chest_xray"); }

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
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">

      {/* ── Header ── */}
      <header className="h-14 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <svg
                className="w-[13px] h-[13px] text-indigo-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12h4l2.5-7 3 14 2.5-7H22" />
              </svg>
            </div>
            <span className="font-semibold text-[13px] text-gray-800 tracking-tight">BioAI Hub</span>
            <span className="hidden sm:block text-gray-300 text-[11px]">/ análisis</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-[11px] text-gray-400 truncate max-w-[180px]">
              {user?.email}
            </span>
            <div className="w-px h-3.5 bg-gray-200" />
            <button
              onClick={() => void logout()}
              className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── LEFT: Input panel ── */}
          <section className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                  Nuevo análisis
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {file ? (
                  <FilePreview file={file} onRemove={handleRemove} />
                ) : (
                  <DropZone onFile={handleFile} disabled={isLoading} />
                )}

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-gray-600">
                    ID del paciente <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="PAC-00123"
                    disabled={isLoading}
                    className={INPUT_CLS}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-gray-600">
                    Tipo de estudio
                  </label>
                  <div className="relative">
                    <select
                      value={studyType}
                      onChange={(e) => setStudyType(e.target.value)}
                      disabled={isLoading}
                      className="w-full appearance-none px-3 py-2.5 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:opacity-40 disabled:bg-gray-50 cursor-pointer transition-all duration-150"
                    >
                      {STUDY_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!file || !patientId || isLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-150 text-sm shadow-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Analizando...
                    </span>
                  ) : "Analizar imagen"}
                </button>

                {(!file || !patientId) && !isLoading && (
                  <p className="text-[11px] text-gray-400 text-center">
                    {!file ? "Subí una imagen para continuar" : "Ingresá el ID del paciente"}
                  </p>
                )}
              </form>
            </div>
          </section>

          {/* ── CENTER: Results panel ── */}
          <section className="lg:col-span-5">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[560px]">

              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isLoading         ? "bg-amber-400 animate-pulse-dot" :
                    status === "done" ? "bg-blue-500"                    : "bg-gray-300"
                  }`} />
                  <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                    Resultado
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-300">EfficientNet-B3</span>
              </div>

              <div className="flex-1 p-4">
                {isLoading && <LoadingSkeleton />}

                {status === "error" && error && (
                  <ErrorBanner message={error} onDismiss={reset} />
                )}

                {status === "done" && result ? (
                  <DiagnosisCard data={result} onReset={handleReset} />
                ) : !isLoading && status !== "error" ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[440px] gap-5 select-none">
                    <div className="w-24 h-32 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center">
                      <svg className="w-12 h-16 text-gray-300" viewBox="0 0 56 56" fill="none" stroke="currentColor">
                        <rect x="10" y="4" width="36" height="48" rx="3" strokeWidth="1.5" />
                        <rect x="10" y="4" width="6" height="6" rx="1" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
                        <rect x="40" y="4" width="6" height="6" rx="1" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
                        <rect x="10" y="46" width="6" height="6" rx="1" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
                        <rect x="40" y="46" width="6" height="6" rx="1" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
                        <path d="M22 16 C19 16 16 18.5 16 22 L16 34 C16 37.5 18 39.5 21 40.5 C21 40.5 22 41.5 28 41.5 C34 41.5 35 40.5 35 40.5 C38 39.5 40 37.5 40 34 L40 22 C40 18.5 37 16 34 16 Z" strokeWidth="1.4" />
                        <path d="M21 23 C23 22 25 22 28 22" strokeWidth="1" strokeOpacity="0.4" />
                        <path d="M35 23 C33 22 31 22 28 22" strokeWidth="1" strokeOpacity="0.4" />
                        <path d="M20 27 C22 26 25 26 28 26" strokeWidth="1" strokeOpacity="0.4" />
                        <path d="M36 27 C34 26 31 26 28 26" strokeWidth="1" strokeOpacity="0.4" />
                      </svg>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-gray-400">
                        Aguardando imagen
                      </p>
                      <p className="text-[11px] text-gray-300">
                        Cargá una radiografía en el panel izquierdo
                      </p>
                    </div>
                    <p className="text-[10px] font-mono text-gray-300">NIH ChestX-ray14 · 14 clases</p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {/* ── RIGHT: History ── */}
          <section className="lg:col-span-3">
            <div className="lg:sticky lg:top-[80px]">
              <HistoryPanel onSelect={handleHistorySelect} />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
