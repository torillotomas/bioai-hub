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
          ? isNormal ? "bg-emerald-500" : isHigh ? "bg-red-500" : isMid ? "bg-amber-500" : "bg-zinc-500"
          : "bg-zinc-800";

        const accentBorder = isNormal ? "border-emerald-500/50"
                           : isHigh   ? "border-red-500/50"
                           : isMid    ? "border-amber-500/50"
                           :            "border-zinc-600/40";

        const labelClass = isWinner ? "text-zinc-200 font-medium" : "text-zinc-500";
        const pctClass   = isWinner
          ? isNormal ? "text-emerald-400" : isHigh ? "text-red-400" : isMid ? "text-amber-400" : "text-zinc-400"
          : "text-zinc-700";

        return (
          <div
            key={label}
            className={`pl-2.5 border-l-2 ${isWinner ? accentBorder : "border-transparent"}`}
          >
            <div className="flex justify-between items-baseline mb-1.5">
              <span className={`text-[11px] font-mono ${labelClass}`}>
                {translatePathology(label)}
              </span>
              <span className={`text-[11px] font-mono font-semibold tabular-nums ${pctClass}`}>
                {pct}%
              </span>
            </div>
            <div className="w-full bg-zinc-900/80 rounded-full h-1.5 overflow-hidden">
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
