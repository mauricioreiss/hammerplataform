export default function AssinaturaLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="text-center mb-8 pt-2">
        <div className="w-16 h-16 bg-zinc-900 rounded-full mx-auto mb-3 border border-zinc-800" />
        <div className="h-7 w-40 bg-zinc-800 rounded mx-auto" />
      </div>

      {/* Plan card skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
          <div>
            <div className="h-2 w-20 bg-zinc-800 rounded mb-2" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
          </div>
          <div className="h-5 w-16 bg-zinc-800 rounded" />
        </div>
        <div className="text-center space-y-2">
          <div className="h-2 w-10 bg-zinc-800 rounded mx-auto" />
          <div className="h-8 w-24 bg-zinc-800 rounded mx-auto" />
          <div className="h-3 w-36 bg-zinc-800 rounded mx-auto mt-2" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="h-14 bg-zinc-800 rounded-xl" />
    </div>
  );
}
