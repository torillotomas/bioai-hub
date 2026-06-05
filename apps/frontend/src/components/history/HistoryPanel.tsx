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
          <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
            <svg className="w-8 h-8 text-warm-faint/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-warm-faint leading-relaxed">
              Los análisis que realices<br />aparecerán aquí.<br />
              <span className="text-warm-faint/70">Guarda hasta 20 estudios.</span>
            </p>
          </div>
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
