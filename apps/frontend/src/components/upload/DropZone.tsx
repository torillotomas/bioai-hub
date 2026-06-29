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
    ? "border-red-300 bg-red-50"
    : isDragActive
    ? "border-indigo-300 bg-indigo-50"
    : "border-gray-300 hover:border-indigo-300 bg-transparent hover:bg-indigo-50/40";

  return (
    <div
      {...getRootProps()}
      className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${borderClass} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-2.5">

        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
          isDragReject
            ? "border-red-200 bg-red-100"
            : isDragActive
            ? "border-indigo-200 bg-indigo-100"
            : "border-gray-200 bg-gray-100"
        }`}>
          {isDragReject ? (
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className={`w-4 h-4 ${isDragActive ? "text-indigo-500" : "text-gray-400"}`}
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

        {isDragReject ? (
          <p className="text-red-500 text-xs">Solo JPEG · PNG · WebP</p>
        ) : isDragActive ? (
          <p className="text-indigo-600 text-xs font-medium">Soltá la imagen...</p>
        ) : (
          <>
            <p className="text-gray-500 text-xs leading-relaxed">
              Arrastrá o{" "}
              <span className="text-indigo-600 underline underline-offset-2">
                seleccioná
              </span>
              {" "}una radiografía
            </p>
            <p className="text-gray-400 text-[10px] font-mono">JPEG · PNG · WebP · 10 MB máx.</p>
          </>
        )}
      </div>
    </div>
  );
}
