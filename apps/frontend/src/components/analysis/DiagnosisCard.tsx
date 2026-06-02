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
    <div className="bg-white border border-warm-border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-warm-border-subtle flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-normal text-warm-text">Resultado del análisis</h2>
          <p className="text-xs text-warm-faint font-mono mt-0.5">ID: {analysis_id}</p>
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Completado
        </span>
      </div>

      {/* Diagnóstico principal */}
      <div className="px-6 py-5 space-y-6">
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-warm-muted font-medium uppercase tracking-wide">Diagnóstico</p>
          <ConfidenceBadge prediction={result.prediction} confidence={result.confidence} />
        </div>

        {/* Gráfico de probabilidades */}
        <div>
          <p className="text-sm text-warm-muted font-medium uppercase tracking-wide mb-3">
            Distribución de probabilidades
          </p>
          <ProbabilityChart scores={result.class_scores} prediction={result.prediction} />
        </div>

        {/* Grad-CAM heatmap */}
        {result.heatmap_b64 && (
          <HeatmapOverlay heatmapB64={result.heatmap_b64} prediction={result.prediction} />
        )}

        {/* Metadata técnica */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-warm-border-subtle">
          <div>
            <p className="text-xs text-warm-faint">Modelo</p>
            <p className="text-sm font-mono text-warm-muted">{result.model_version}</p>
          </div>
          <div>
            <p className="text-xs text-warm-faint">Tiempo de inferencia</p>
            <p className="text-sm font-mono text-warm-muted">{result.inference_time_ms}ms</p>
          </div>
          <div>
            <p className="text-xs text-warm-faint">Procesado</p>
            <p className="text-sm text-warm-muted">
              {new Date(audit.processed_at).toLocaleString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-xs text-warm-faint">SHA-256</p>
            <p className="text-xs font-mono text-warm-faint truncate">{audit.image_hash_sha256.slice(0, 16)}…</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-warm-surface2 border-t border-warm-border-subtle">
        <p className="text-xs text-warm-faint mb-3 flex items-start gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-warm-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          Este resultado es generado por un modelo de IA con fines educativos. No reemplaza el diagnóstico médico profesional.
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
