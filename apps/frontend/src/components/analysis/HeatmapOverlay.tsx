import { useState } from "react";

interface HeatmapOverlayProps {
  heatmapB64: string;
  prediction: string;
}

type Mode = "heatmap" | "split";

export function HeatmapOverlay({ heatmapB64, prediction }: HeatmapOverlayProps) {
  const [mode, setMode] = useState<Mode>("heatmap");
  const [splitPct, setSplitPct] = useState(50);
  const src = `data:image/jpeg;base64,${heatmapB64}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-700">
          Grad-CAM · activación
        </p>
        {/* Toggle buttons */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setMode("heatmap")}
            className={`px-2 py-1 rounded-md text-xs font-mono transition-colors ${
              mode === "heatmap"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Heatmap
          </button>
          <button
            onClick={() => setMode("split")}
            className={`px-2 py-1 rounded-md text-xs font-mono transition-colors ${
              mode === "split"
                ? "bg-zinc-700 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Split
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
        {mode === "heatmap" ? (
          <>
            <img
              src={src}
              alt={`Grad-CAM — ${prediction}`}
              className="w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-3">
              <p className="text-xs text-zinc-400 font-mono">
                Zonas rojas → mayor activación del modelo
              </p>
            </div>
          </>
        ) : (
          <div className="relative select-none">
            {/* Base: heatmap full width */}
            <img src={src} alt={`Grad-CAM — ${prediction}`} className="w-full object-cover" />

            {/* Overlay: same heatmap with clip — simulates "original" side via blend */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${splitPct}%` }}
            >
              <img
                src={src}
                alt="split"
                className="w-full object-cover"
                style={{
                  width: `${10000 / splitPct}%`,
                  filter: "grayscale(1) brightness(1.1)",
                }}
              />
            </div>

            {/* Divider line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-white/60 shadow-[0_0_8px_2px_rgba(255,255,255,0.3)]"
              style={{ left: `${splitPct}%` }}
            />

            {/* Drag range */}
            <input
              type="range"
              min={5}
              max={95}
              value={splitPct}
              onChange={(e) => setSplitPct(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
            />

            {/* Labels */}
            <div className="absolute bottom-2 left-2">
              <span className="text-[10px] font-mono text-white/70 bg-black/50 px-1.5 py-0.5 rounded">
                Original
              </span>
            </div>
            <div className="absolute bottom-2 right-2">
              <span className="text-[10px] font-mono text-white/70 bg-black/50 px-1.5 py-0.5 rounded">
                Grad-CAM
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
