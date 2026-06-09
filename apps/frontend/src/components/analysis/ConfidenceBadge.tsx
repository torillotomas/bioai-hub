import { translatePathology } from "../../utils/pathologyNames";

interface ConfidenceBadgeProps {
  confidence: number;
  prediction: string;
}

export function ConfidenceBadge({ confidence, prediction }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);

  const isNormal = prediction === "No Finding";
  const isHigh   = confidence >= 0.6 && !isNormal;
  const isMid    = confidence >= 0.3 && confidence < 0.6 && !isNormal;

  const nameColor  = isNormal ? "text-emerald-400" : isHigh ? "text-red-400"  : isMid ? "text-amber-400"  : "text-zinc-300";
  const pctColor   = isNormal ? "text-emerald-400" : isHigh ? "text-red-400"  : isMid ? "text-amber-400"  : "text-zinc-500";
  const barColor   = isNormal ? "bg-emerald-500"   : isHigh ? "bg-red-500"    : isMid ? "bg-amber-500"    : "bg-zinc-600";
  const borderTint = isNormal ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                   : isHigh   ? "border-red-500/20 bg-red-500/[0.04]"
                   : isMid    ? "border-amber-500/20 bg-amber-500/[0.04]"
                   :            "border-zinc-800 bg-zinc-950/40";

  const statusLabel = isNormal ? "HALLAZGO NORMAL" : "HALLAZGO PATOLÓGICO";
  const statusColor = isNormal ? "text-emerald-500/70" : "text-red-500/70";

  return (
    <div className={`rounded-xl border ${borderTint} px-4 py-4 relative overflow-hidden`}>

      {/* Section label */}
      <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-600 mb-3">
        Diagnóstico principal
      </p>

      {/* Main content row */}
      <div className="flex items-start justify-between gap-4">
        {/* Prediction name — imposing display */}
        <div className="flex-1 min-w-0">
          <span className={`font-mono text-[1.65rem] font-bold tracking-tight leading-none break-words ${nameColor}`}>
            {translatePathology(prediction)}
          </span>
          <p className={`text-[9px] font-mono uppercase tracking-[0.14em] mt-2 ${statusColor}`}>
            {statusLabel}
          </p>
        </div>

        {/* Confidence number — right-aligned */}
        <div className="shrink-0 text-right">
          <div className={`font-mono text-[2.5rem] font-bold leading-none tabular-nums ${pctColor}`}>
            {pct}
            <span className="text-xl text-zinc-700 ml-0.5">%</span>
          </div>
          <p className="text-[9px] font-mono uppercase tracking-[0.12em] text-zinc-600 mt-1.5">
            confianza
          </p>
        </div>
      </div>

      {/* Thin confidence bar */}
      <div className="mt-4 w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
        <div
          className={`h-full rounded-full animate-bar ${barColor}`}
          style={{ "--bar-w": `${pct}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
