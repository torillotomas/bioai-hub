interface HeatmapOverlayProps {
  heatmapB64: string;
  prediction: string;
}

export function HeatmapOverlay({ heatmapB64, prediction }: HeatmapOverlayProps) {
  return (
    <div>
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-3">
        Mapa de activación (Grad-CAM)
      </p>
      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <img
          src={`data:image/jpeg;base64,${heatmapB64}`}
          alt={`Grad-CAM — ${prediction}`}
          className="w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
          <p className="text-xs text-white/80">
            Las zonas rojas indican las regiones que más influyeron en el diagnóstico.
          </p>
        </div>
      </div>
    </div>
  );
}
