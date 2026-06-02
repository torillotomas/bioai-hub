import { useAnalysisStore } from "../../stores/analysisStore";
import { HistoryItem } from "./HistoryItem";
import type { AnalysisResponse } from "../../types/analysis";

interface HistoryPanelProps {
  onSelect: (item: AnalysisResponse) => void;
}

export function HistoryPanel({ onSelect }: HistoryPanelProps) {
  const { history, clearHistory } = useAnalysisStore();

  return (
    <aside className="w-full sm:w-64 sm:shrink-0 bg-white border border-warm-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-warm-border-subtle flex items-center justify-between">
        <h3 className="text-base font-semibold text-warm-text">Historial</h3>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-warm-faint hover:text-red-500 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {history.length === 0 ? (
          <p className="text-xs text-warm-faint text-center py-6 px-3">
            Los análisis aparecerán aquí
          </p>
        ) : (
          <div className="space-y-1">
            {history.map((item) => (
              <HistoryItem key={item.analysis_id} item={item} onClick={onSelect} />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-warm-border-subtle">
        <p className="text-xs text-warm-faint">{history.length}/20 análisis</p>
      </div>
    </aside>
  );
}
