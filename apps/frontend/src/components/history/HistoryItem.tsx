import type { AnalysisResponse } from "../../types/analysis";
import { translatePathology } from "../../utils/pathologyNames";

interface HistoryItemProps {
  item: AnalysisResponse;
  onClick: (item: AnalysisResponse) => void;
}

export function HistoryItem({ item, onClick }: HistoryItemProps) {
  const pct = Math.round(item.result.confidence * 100);
  const date = new Date(item.audit.processed_at).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  const isNormal = item.result.prediction === "No Finding";
  const isHigh   = item.result.confidence >= 0.6 && !isNormal;
  const isMid    = item.result.confidence >= 0.3 && item.result.confidence < 0.6 && !isNormal;

  const dotColor = isNormal ? "bg-emerald-500" : isHigh ? "bg-red-500" : isMid ? "bg-amber-500" : "bg-zinc-500";
  const pctColor = isNormal ? "text-emerald-400" : isHigh ? "text-red-400" : isMid ? "text-amber-400" : "text-zinc-500";

  return (
    <button
      onClick={() => onClick(item)}
      className="w-full text-left px-3 py-2.5 hover:bg-zinc-800/40 transition-colors"
    >
      {/* Top row: diagnosis + confidence */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
          <span className="text-[11px] font-mono text-zinc-300 truncate">
            {translatePathology(item.result.prediction)}
          </span>
        </div>
        <span className={`text-[11px] font-mono font-semibold shrink-0 tabular-nums ${pctColor}`}>
          {pct}%
        </span>
      </div>

      {/* Bottom row: date + truncated ID */}
      <div className="flex items-center justify-between mt-0.5 pl-3">
        <span className="text-[10px] font-mono text-zinc-600">{date}</span>
        <span className="text-[10px] font-mono text-zinc-800">{item.analysis_id.slice(0, 8)}</span>
      </div>
    </button>
  );
}
