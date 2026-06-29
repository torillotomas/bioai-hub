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
        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
          Grad-CAM — activación
        </p>
        <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setMode("heatmap")}
            className={`px-2 py-1 rounded-md text-xs font-mono transition-colors ${
              mode === "heatmap"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Heatmap
          </button>
          <button
            onClick={() => setMode("split")}
            className={`px-2 py-1 rounded-md text-xs font-mono transition-colors ${
              mode === "split"
                ? "bg-white shadow-sm text-gray-800"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Split
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
        {mode === "heatmap" ? (
          <>
            <img
              src={src}
              alt={`Grad-CAM — ${prediction}`}
              className="w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-3">
              <p className="text-xs text-white/80 font-mono">
                Zonas rojas → mayor activación del modelo
              </p>
            </div>
          </>
        ) : (
          <div className="relative select-none">
            <img src={src} alt={`Grad-CAM — ${prediction}`} className="w-full object-cover" />

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

            <div
              className="absolute top-0 bottom-0 w-px bg-white/70 shadow-[0_0_6px_2px_rgba(255,255,255,0.4)]"
              style={{ left: `${splitPct}%` }}
            />

            <input
              type="range"
              min={5}
              max={95}
              value={splitPct}
              onChange={(e) => setSplitPct(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
            />

            <div className="absolute bottom-2 left-2">
              <span className="text-[10px] font-mono text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                Original
              </span>
            </div>
            <div className="absolute bottom-2 right-2">
              <span className="text-[10px] font-mono text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                Grad-CAM
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
