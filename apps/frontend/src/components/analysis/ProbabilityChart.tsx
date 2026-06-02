import { translatePathology } from "../../utils/pathologyNames";

interface ProbabilityChartProps {
  scores: Record<string, number>;
  prediction: string;
  topN?: number;
}

const DEFAULT_COLOR = "bg-brand-600";
const HIGH_CONFIDENCE_COLOR = "bg-red-600";

export function ProbabilityChart({ scores, prediction, topN = 8 }: ProbabilityChartProps) {
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN);

  return (
    <div className="space-y-3">
      {sorted.map(([label, score]) => {
        const pct = Math.round(score * 100);
        const isWinner = label === prediction;
        const barColor = score >= 0.6 ? HIGH_CONFIDENCE_COLOR : DEFAULT_COLOR;

        return (
          <div key={label}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm font-medium ${isWinner ? "text-warm-text" : "text-warm-muted"}`}>
                {translatePathology(label)}
                {isWinner && (
                  <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded bg-warm-surface2 text-warm-muted">
                    predicción
                  </span>
                )}
              </span>
              <span className={`text-sm font-bold ${isWinner ? "text-warm-text" : "text-warm-faint"}`}>
                {pct}%
              </span>
            </div>
            <div className="w-full bg-warm-surface2 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${barColor} ${!isWinner ? "opacity-40" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
