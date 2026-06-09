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
    result.inference_time_ms < 500  ? "text-emerald-400" :
    result.inference_time_ms < 2000 ? "text-amber-400"   : "text-red-400";

  return (
    <div className="animate-fade-in">

      {/* ── 1. Confidence badge — diagnostic hero ── */}
      <ConfidenceBadge prediction={result.prediction} confidence={result.confidence} />

      {/* ── 2. Grad-CAM heatmap ── */}
      {result.heatmap_b64 && (
        <div className="mt-4 pt-4 border-t border-zinc-800/50">
          <HeatmapOverlay heatmapB64={result.heatmap_b64} prediction={result.prediction} />
        </div>
      )}

      {/* ── 3. Class-score distribution ── */}
      <div className="mt-4 pt-4 border-t border-zinc-800/50">
        <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-700 mb-3">
          Distribución de probabilidades
        </p>
        <ProbabilityChart scores={result.class_scores} prediction={result.prediction} />
      </div>

      {/* ── 4. Audit console — terminal style ── */}
      <div className="mt-4 pt-4 border-t border-zinc-800/50">
        <div className="rounded-lg bg-black/40 border border-zinc-900 overflow-hidden">

          {/* Title bar */}
          <div className="px-3 py-2 border-b border-zinc-900 flex items-center gap-1.5 bg-zinc-950/60">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500/50" />
              <span className="w-2 h-2 rounded-full bg-amber-500/50" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>
            <span className="ml-1.5 text-[9px] font-mono text-zinc-700 tracking-wide">
              inference_audit.log
            </span>
          </div>

          {/* Key-value rows */}
          <div className="px-3 py-3 space-y-1.5 font-mono text-[11px]">
            <div className="flex gap-2">
              <span className="text-cyan-700/80 w-36 shrink-0 select-none">inference_time_ms</span>
              <span className={`tabular-nums ${inferenceColor}`}>
                {result.inference_time_ms}
                <span className="text-zinc-600 ml-1">ms</span>
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-cyan-700/80 w-36 shrink-0 select-none">model_version</span>
              <span className="text-zinc-300">{result.model_version}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-cyan-700/80 w-36 shrink-0 select-none">image_hash_sha256</span>
              <span className="text-zinc-600 tracking-wider">
                {audit.image_hash_sha256.slice(0, 10)}
                <span className="text-zinc-800">…</span>
                {audit.image_hash_sha256.slice(-6)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Disclaimer + reset ── */}
      <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-start justify-between gap-4">
        <p className="text-[10px] text-zinc-700 leading-relaxed flex-1">
          Resultado generado por IA con fines educativos. No reemplaza el diagnóstico médico profesional.
        </p>
        <button
          onClick={onReset}
          className="shrink-0 text-[11px] text-zinc-600 hover:text-emerald-400 transition-colors font-mono whitespace-nowrap"
        >
          ← nuevo análisis
        </button>
      </div>
    </div>
  );
}
