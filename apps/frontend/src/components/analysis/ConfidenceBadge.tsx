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

  const nameColor  = isNormal ? "text-blue-600"   : isHigh ? "text-orange-600" : isMid ? "text-amber-600"  : "text-gray-600";
  const pctColor   = isNormal ? "text-blue-600"   : isHigh ? "text-orange-600" : isMid ? "text-amber-600"  : "text-gray-500";
  const barColor   = isNormal ? "bg-blue-500"     : isHigh ? "bg-orange-500"   : isMid ? "bg-amber-500"    : "bg-gray-400";
  const borderTint = isNormal ? "border-blue-200 bg-blue-50"
                   : isHigh   ? "border-orange-200 bg-orange-50"
                   : isMid    ? "border-amber-200 bg-amber-50"
                   :            "border-gray-200 bg-gray-50";

  const statusLabel = isNormal ? "Sin hallazgos patológicos" : "Hallazgo patológico detectado";
  const statusColor = isNormal ? "text-blue-500" : "text-orange-500";

  return (
    <div className={`rounded-xl border ${borderTint} px-4 py-4`}>

      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-3">
        Diagnóstico principal
      </p>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className={`text-[1.65rem] font-bold tracking-tight leading-none break-words ${nameColor}`}>
            {translatePathology(prediction)}
          </span>
          <p className={`text-[10px] uppercase tracking-wide mt-2 font-medium ${statusColor}`}>
            {statusLabel}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <div className={`text-[2.5rem] font-bold leading-none tabular-nums ${pctColor}`}>
            {pct}
            <span className="text-xl text-gray-300 ml-0.5">%</span>
          </div>
          <p className="text-[10px] uppercase tracking-wide text-gray-400 mt-1.5">
            confianza
          </p>
        </div>
      </div>

      <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full animate-bar ${barColor}`}
          style={{ "--bar-w": `${pct}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}
