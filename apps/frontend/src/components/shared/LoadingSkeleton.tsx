export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6 border border-gray-200 rounded-xl bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
      <p className="text-center text-sm text-gray-400 pt-2">Analizando imagen...</p>
    </div>
  );
}
