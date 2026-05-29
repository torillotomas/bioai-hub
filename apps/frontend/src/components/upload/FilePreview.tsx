interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const url = URL.createObjectURL(file);
  const sizeKb = (file.size / 1024).toFixed(1);

  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
      <img
        src={url}
        alt="Preview"
        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
        onLoad={() => URL.revokeObjectURL(url)}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
        <p className="text-xs text-gray-400">{sizeKb} KB · {file.type}</p>
      </div>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Eliminar archivo"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
