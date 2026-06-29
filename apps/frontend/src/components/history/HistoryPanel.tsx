import { useAnalysisStore } from "../../stores/analysisStore";
import { HistoryItem } from "./HistoryItem";
import type { AnalysisResponse } from "../../types/analysis";

interface HistoryPanelProps {
  onSelect: (item: AnalysisResponse) => void;
}

export function HistoryPanel({ onSelect }: HistoryPanelProps) {
  const { history, clearHistory } = useAnalysisStore();

  return (
    <aside className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm">

      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h3 className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Historial</h3>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-[10px] font-mono text-gray-400 hover:text-red-500 transition-colors"
          >
            limpiar
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1" style={{ maxHeight: "calc(100vh - 180px)" }}>
        {history.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 py-10 px-4 text-center">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Sin análisis previos.<br />Guardamos hasta 20.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((item) => (
              <HistoryItem key={item.analysis_id} item={item} onClick={onSelect} />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-gray-100 shrink-0">
        <p className="text-[10px] font-mono text-gray-400">{history.length}/20 registros</p>
      </div>
    </aside>
  );
}
