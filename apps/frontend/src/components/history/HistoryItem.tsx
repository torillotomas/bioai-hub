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
  const badgeColor =
    item.result.confidence < 0.3
      ? "bg-green-100 text-green-700"
      : item.result.confidence < 0.6
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  return (
    <button
      onClick={() => onClick(item)}
      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-warm-surface2 transition-colors group"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
          {translatePathology(item.result.prediction)}
        </span>
        <span className="text-xs text-warm-faint">{pct}%</span>
      </div>
      <p className="text-xs text-warm-muted mt-1 truncate">{date}</p>
    </button>
  );
}
