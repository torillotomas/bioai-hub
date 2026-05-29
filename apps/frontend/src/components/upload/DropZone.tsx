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
    : "border-gray-300 bg-white hover:border-brand-500 hover:bg-gray-50";

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${borderColor} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-3">
        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>

        {isDragReject ? (
          <p className="text-red-600 font-medium">Solo se aceptan imágenes (JPEG, PNG, WebP)</p>
        ) : isDragActive ? (
          <p className="text-brand-600 font-medium">Soltá la imagen aquí...</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">
              Arrastrá una radiografía o <span className="text-brand-600 underline">seleccioná un archivo</span>
            </p>
            <p className="text-gray-400 text-sm">JPEG, PNG o WebP · Máx. 10MB</p>
          </>
        )}
      </div>
    </div>
  );
}
