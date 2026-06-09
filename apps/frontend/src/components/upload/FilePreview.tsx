interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const url = URL.createObjectURL(file);
  const sizeKb = (file.size / 1024).toFixed(1);

  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-950/60 border border-zinc-700 rounded-xl">
      <div className="relative shrink-0">
        <img
          src={url}
          alt="Preview"
          className="w-14 h-14 object-cover rounded-lg border border-zinc-700"
          onLoad={() => URL.revokeObjectURL(url)}
        />
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 truncate font-mono">{file.name}</p>
        <p className="text-xs text-zinc-500 font-mono mt-0.5">{sizeKb} KB · {file.type.split("/")[1].toUpperCase()}</p>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-500/80 font-mono">Listo</span>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="text-zinc-600 hover:text-red-400 transition-colors p-1"
        aria-label="Eliminar archivo"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
