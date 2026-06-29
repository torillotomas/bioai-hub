export function LoadingSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        <div className="h-3.5 w-36 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="p-5 space-y-5">
        <div className="relative h-48 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 opacity-40">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 56 56" fill="none" stroke="currentColor">
              <rect x="10" y="4" width="36" height="48" rx="3" strokeWidth="1.5" />
              <path d="M22 16 C19 16 16 18.5 16 22 L16 34 C16 37.5 18 39.5 21 40.5 C28 41.5 35 40.5 35 40.5 C38 39.5 40 37.5 40 34 L40 22 C40 18.5 37 16 34 16 Z" strokeWidth="1.4" />
            </svg>
            <p className="text-xs font-mono text-gray-400">Analizando imagen...</p>
          </div>
        </div>

        <div className="space-y-3">
          {[80, 55, 40, 25, 15].map((w, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-2.5 bg-gray-200 rounded animate-pulse" style={{ width: "30%" }} />
                <div className="h-2.5 bg-gray-200 rounded animate-pulse w-8" />
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-full rounded-full bg-gray-200 animate-pulse"
                  style={{ width: `${w}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1.5">
          {["model_version", "inference_ms", "processed_at", "sha256"].map((k) => (
            <div key={k} className="flex gap-3">
              <span className="text-xs font-mono text-gray-400 w-32 shrink-0">{k}</span>
              <div className="h-2.5 bg-gray-200 rounded animate-pulse flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
