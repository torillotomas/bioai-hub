export function LoadingSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Fake header */}
      <div className="px-5 py-3.5 border-b border-zinc-800/60 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
        <div className="h-3.5 w-36 bg-zinc-800 rounded animate-pulse" />
      </div>

      <div className="p-5 space-y-5">
        {/* Scanner bar */}
        <div className="relative h-48 bg-zinc-950/60 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
          {/* Animated scan line */}
          <span
            className="animate-scan pointer-events-none absolute left-0 right-0 h-px bg-cyan-400/40"
            style={{ boxShadow: "0 0 12px 4px rgba(34,211,238,0.15)" }}
          />
          <div className="flex flex-col items-center gap-2 opacity-30">
            <svg className="w-8 h-8 text-zinc-500" viewBox="0 0 56 56" fill="none" stroke="currentColor">
              <rect x="10" y="4" width="36" height="48" rx="3" strokeWidth="1.5" />
              <path d="M22 16 C19 16 16 18.5 16 22 L16 34 C16 37.5 18 39.5 21 40.5 C28 41.5 35 40.5 35 40.5 C38 39.5 40 37.5 40 34 L40 22 C40 18.5 37 16 34 16 Z" strokeWidth="1.4" />
            </svg>
            <p className="text-xs font-mono text-zinc-500">Analizando imagen...</p>
          </div>
        </div>

        {/* Bars skeleton */}
        <div className="space-y-3">
          {[80, 55, 40, 25, 15].map((w, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-2.5 bg-zinc-800 rounded animate-pulse" style={{ width: "30%" }} />
                <div className="h-2.5 bg-zinc-800 rounded animate-pulse w-8" />
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5">
                <div
                  className="h-full rounded-full bg-zinc-800 animate-pulse"
                  style={{ width: `${w}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Metadata console skeleton */}
        <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-3 space-y-1.5">
          {["model_version", "inference_ms", "processed_at", "sha256"].map((k) => (
            <div key={k} className="flex gap-3">
              <span className="text-xs font-mono text-cyan-500/40 w-32 shrink-0">{k}</span>
              <div className="h-2.5 bg-zinc-800 rounded animate-pulse flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
