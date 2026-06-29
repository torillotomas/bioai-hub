import { translatePathology } from "../../utils/pathologyNames";

interface ProbabilityChartProps {
  scores: Record<string, number>;
  prediction: string;
  topN?: number;
}

export function ProbabilityChart({ scores, prediction, topN = 8 }: ProbabilityChartProps) {
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN);

  return (
    <div className="space-y-2.5">
      {sorted.map(([label, score], i) => {
        const pct      = Math.round(score * 100);
        const isWinner = label === prediction;
        const isNormal = label === "No Finding";
        const isHigh   = score >= 0.6 && !isNormal;
        const isMid    = score >= 0.3 && score < 0.6 && !isNormal;

        const barColor = isWinner
          ? isNormal ? "bg-blue-500" : isHigh ? "bg-orange-500" : isMid ? "bg-amber-500" : "bg-gray-400"
          : "bg-gray-200";

        const leftBorder = isNormal ? "border-blue-300"
                         : isHigh   ? "border-orange-300"
                         : isMid    ? "border-amber-300"
                         :            "border-gray-300";

        const labelClass = isWinner ? "text-gray-800 font-medium" : "text-gray-400";
        const pctClass   = isWinner
          ? isNormal ? "text-blue-600" : isHigh ? "text-orange-600" : isMid ? "text-amber-600" : "text-gray-500"
          : "text-gray-300";

        return (
          <div
            key={label}
            className={`pl-2.5 border-l-2 ${isWinner ? leftBorder : "border-transparent"}`}
          >
            <div className="flex justify-between items-baseline mb-1.5">
              <span className={`text-[11px] font-mono ${labelClass}`}>
                {translatePathology(label)}
              </span>
              <span className={`text-[11px] font-mono font-semibold tabular-nums ${pctClass}`}>
                {pct}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full animate-bar ${barColor}`}
                style={{
                  "--bar-w": `${pct}%`,
                  animationDelay: `${i * 55}ms`,
                } as React.CSSProperties}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
