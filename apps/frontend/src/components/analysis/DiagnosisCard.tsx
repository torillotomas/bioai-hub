import type { AnalysisResponse } from "../../types/analysis";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ProbabilityChart } from "./ProbabilityChart";
import { HeatmapOverlay } from "./HeatmapOverlay";

interface DiagnosisCardProps {
  data: AnalysisResponse;
  onReset: () => void;
}

export function DiagnosisCard({ data, onReset }: DiagnosisCardProps) {
  const { result, audit, analysis_id } = data;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Resultado del análisis</h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {analysis_id}</p>
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Completado
        </span>
      </div>

      {/* Diagnóstico principal */}
      <div className="px-6 py-5 space-y-6">
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Diagnóstico</p>
          <ConfidenceBadge prediction={result.prediction} confidence={result.confidence} />
        </div>

        {/* Gráfico de probabilidades */}
        <div>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-3">
            Distribución de probabilidades
          </p>
          <ProbabilityChart scores={result.class_scores} prediction={result.prediction} />
        </div>

        {/* Grad-CAM heatmap */}
        {result.heatmap_b64 && (
          <HeatmapOverlay heatmapB64={result.heatmap_b64} prediction={result.prediction} />
        )}

        {/* Metadata técnica */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Modelo</p>
            <p className="text-sm font-mono text-gray-600">{result.model_version}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Tiempo de inferencia</p>
            <p className="text-sm font-mono text-gray-600">{result.inference_time_ms}ms</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Procesado</p>
            <p className="text-sm text-gray-600">
              {new Date(audit.processed_at).toLocaleString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">SHA-256</p>
            <p className="text-xs font-mono text-gray-400 truncate">{audit.image_hash_sha256.slice(0, 16)}…</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-3">
          ⚠️ Este resultado es generado por un modelo de IA con fines educativos. No reemplaza el diagnóstico médico profesional.
        </p>
        <button
          onClick={onReset}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
        >
          ← Analizar otra imagen
        </button>
      </div>
    </div>
  );
}
