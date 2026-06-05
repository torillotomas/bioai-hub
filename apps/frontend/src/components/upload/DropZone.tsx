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

  const borderColor = isDragReject
    ? "border-red-400 bg-red-50"
    : isDragActive
    ? "border-brand-500 bg-brand-50"
    : "border-warm-border bg-white hover:border-brand-400 hover:bg-warm-surface2";

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${borderColor} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-3">
        {/* Ícono de radiografía / scan médico */}
        <svg
          className={`w-14 h-14 transition-colors ${isDragActive ? "text-brand-500" : isDragReject ? "text-red-400" : "text-warm-faint"}`}
          viewBox="0 0 56 56"
          fill="none"
          stroke="currentColor"
        >
          {/* Marco de film radiográfico */}
          <rect x="10" y="4" width="36" height="48" rx="3" strokeWidth="1.5" />
          {/* Marcadores de esquina superiores */}
          <rect x="10" y="4" width="6" height="6" rx="1" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
          <rect x="40" y="4" width="6" height="6" rx="1" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
          {/* Marcadores de esquina inferiores */}
          <rect x="10" y="46" width="6" height="6" rx="1" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
          <rect x="40" y="46" width="6" height="6" rx="1" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
          {/* Silueta de tórax */}
          <path
            d="M22 16 C19 16 16 18.5 16 22 L16 34 C16 37.5 18 39.5 21 40.5 C21 40.5 22 41.5 28 41.5 C34 41.5 35 40.5 35 40.5 C38 39.5 40 37.5 40 34 L40 22 C40 18.5 37 16 34 16 Z"
            strokeWidth="1.4"
          />
          {/* Líneas de costillas */}
          <path d="M21 23 C23 22 25 22 28 22" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M35 23 C33 22 31 22 28 22" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M20 27 C22 26 25 26 28 26" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M36 27 C34 26 31 26 28 26" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M20 31 C22 30 25 30 28 30" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M36 31 C34 30 31 30 28 30" strokeWidth="1" strokeOpacity="0.5" />
        </svg>

        {isDragReject ? (
          <p className="text-red-600 font-medium text-sm">Solo se aceptan imágenes (JPEG, PNG, WebP)</p>
        ) : isDragActive ? (
          <p className="text-brand-600 font-medium text-sm">Soltá la radiografía aquí...</p>
        ) : (
          <>
            <p className="text-warm-muted font-medium text-sm">
              Arrastrá una radiografía o{" "}
              <span className="text-brand-600 underline underline-offset-2">seleccioná un archivo</span>
            </p>
            <p className="text-warm-faint text-xs">JPEG, PNG o WebP · Máx. 10MB</p>
          </>
        )}
      </div>
    </div>
  );
}
