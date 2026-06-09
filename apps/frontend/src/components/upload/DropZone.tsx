import { useDropzone } from "react-dropzone";

interface DropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = { "image/jpeg": [], "image/png": [], "image/webp": [] };

export function DropZone({ onFile, disabled }: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled,
    onDropAccepted: ([file]) => onFile(file),
  });

  const borderClass = isDragReject
    ? "border-red-500/50 bg-red-500/5"
    : isDragActive
    ? "border-emerald-500/50 bg-emerald-500/5"
    : "border-zinc-700 hover:border-zinc-600 bg-transparent hover:bg-zinc-900/30";

  return (
    <div
      {...getRootProps()}
      className={`relative border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 overflow-hidden ${borderClass} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />

      {/* Scanner line — active on drag */}
      {isDragActive && !isDragReject && (
        <span
          className="animate-scan pointer-events-none absolute left-0 right-0 h-px bg-emerald-400/50"
          style={{ boxShadow: "0 0 8px 2px rgba(0,245,160,0.18)" }}
        />
      )}

      <div className="flex flex-col items-center gap-2.5 relative">

        {/* Icon container */}
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
          isDragReject
            ? "border-red-500/40 bg-red-500/10"
            : isDragActive
            ? "border-emerald-500/40 bg-emerald-500/10"
            : "border-zinc-800 bg-zinc-900"
        }`}>
          {isDragReject ? (
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className={`w-4 h-4 ${isDragActive ? "text-emerald-400" : "text-cyan-600"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>

        {/* Text */}
        {isDragReject ? (
          <p className="text-red-400 font-mono text-xs">Solo JPEG · PNG · WebP</p>
        ) : isDragActive ? (
          <p className="text-emerald-400 font-mono text-xs tracking-wide">Soltá la imagen...</p>
        ) : (
          <>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Arrastrá o{" "}
              <span className="text-emerald-500 underline underline-offset-2 decoration-emerald-500/40">
                seleccioná
              </span>
              {" "}una radiografía
            </p>
            <p className="text-zinc-700 text-[10px] font-mono">JPEG · PNG · WebP · 10 MB máx.</p>
          </>
        )}
      </div>
    </div>
  );
}
