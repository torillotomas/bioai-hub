interface ProbabilityChartProps {
  scores: Record<string, number>;
  prediction: string;
}

const CLASS_COLORS: Record<string, string> = {
  NORMAL: "bg-green-500",
  PNEUMONIA: "bg-red-500",
};

const DEFAULT_COLOR = "bg-blue-500";

export function ProbabilityChart({ scores, prediction }: ProbabilityChartProps) {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-3">
      {sorted.map(([label, score]) => {
        const pct = Math.round(score * 100);
        const isWinner = label === prediction;
        const barColor = CLASS_COLORS[label] ?? DEFAULT_COLOR;

        return (
          <div key={label}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm font-medium ${isWinner ? "text-gray-800" : "text-gray-500"}`}>
                {label}
                {isWinner && (
                  <span className="ml-2 text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                    predicción
                  </span>
                )}
              </span>
              <span className={`text-sm font-bold ${isWinner ? "text-gray-800" : "text-gray-400"}`}>
                {pct}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
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
