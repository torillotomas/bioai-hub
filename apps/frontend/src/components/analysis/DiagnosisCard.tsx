import type { AnalysisResponse } from "../../types/analysis";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ProbabilityChart } from "./ProbabilityChart";
import { HeatmapOverlay } from "./HeatmapOverlay";

interface DiagnosisCardProps {
  data: AnalysisResponse;
  onReset: () => void;
}

export function DiagnosisCard({ data, onReset }: DiagnosisCardProps) {
  const { result, audit } = data;

  const inferenceColor =
    result.inference_time_ms < 500  ? "text-green-600" :
    result.inference_time_ms < 2000 ? "text-amber-600" : "text-red-600";

  return (
    <div className="animate-fade-in">

      {/* ── 1. Confidence badge ── */}
      <ConfidenceBadge prediction={result.prediction} confidence={result.confidence} />

      {/* ── 2. Grad-CAM heatmap ── */}
      {result.heatmap_b64 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <HeatmapOverlay heatmapB64={result.heatmap_b64} prediction={result.prediction} />
        </div>
      )}

      {/* ── 3. Class-score distribution ── */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-3">
          Distribución de probabilidades
        </p>
        <ProbabilityChart scores={result.class_scores} prediction={result.prediction} />
      </div>

      {/* ── 4. Metadata ── */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="rounded-lg bg-gray-50 border border-gray-200 overflow-hidden">

          <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2 bg-gray-100">
            <span className="text-[10px] font-mono text-gray-500 tracking-wide">
              Detalles de inferencia
            </span>
          </div>

          <div className="px-3 py-3 space-y-1.5 font-mono text-[11px]">
            <div className="flex gap-2">
              <span className="text-gray-400 w-36 shrink-0">inference_time_ms</span>
              <span className={`tabular-nums ${inferenceColor}`}>
                {result.inference_time_ms}
                <span className="text-gray-400 ml-1">ms</span>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-36 shrink-0">model_version</span>
              <span className="text-gray-700">{result.model_version}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-36 shrink-0">image_hash_sha256</span>
              <span className="text-gray-400 tracking-wider">
                {audit.image_hash_sha256.slice(0, 10)}
                <span className="text-gray-300">…</span>
                {audit.image_hash_sha256.slice(-6)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Disclaimer + reset ── */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-start justify-between gap-4">
        <p className="text-[10px] text-gray-400 leading-relaxed flex-1">
          Resultado generado por IA con fines educativos. No reemplaza el diagnóstico médico profesional.
        </p>
        <button
          onClick={onReset}
          className="shrink-0 text-[11px] text-gray-400 hover:text-indigo-600 transition-colors font-mono whitespace-nowrap"
        >
          ← nuevo análisis
        </button>
      </div>
    </div>
  );
}
