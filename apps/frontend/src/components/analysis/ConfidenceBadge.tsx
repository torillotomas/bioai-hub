interface ConfidenceBadgeProps {
  confidence: number;
  prediction: string;
}

export function ConfidenceBadge({ confidence, prediction }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);
  const isNormal = prediction === "NORMAL";

  const color = isNormal
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-red-100 text-red-700 border-red-200";

  const icon = isNormal ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-lg ${color}`}>
      {icon}
      {prediction} — {pct}% de confianza
    </div>
  );
}
