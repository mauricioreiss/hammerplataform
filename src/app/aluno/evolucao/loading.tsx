export default function EvolucaoLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="text-center mb-6 pt-2">
        <div className="h-8 w-48 bg-zinc-800 rounded mx-auto mb-2" />
        <div className="h-3 w-40 bg-zinc-800 rounded mx-auto" />
      </div>

      {/* Date range skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex justify-between">
        <div className="flex-1 text-center">
          <div className="h-2 w-10 bg-zinc-800 rounded mx-auto mb-1" />
          <div className="h-4 w-20 bg-zinc-800 rounded mx-auto" />
        </div>
        <div className="flex-1 text-center">
          <div className="h-2 w-10 bg-zinc-800 rounded mx-auto mb-1" />
          <div className="h-4 w-20 bg-zinc-800 rounded mx-auto" />
        </div>
      </div>

      {/* Photos skeleton */}
      <div className="grid grid-cols-2 gap-2">
        <div className="aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-xl" />
        <div className="aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-xl" />
      </div>

      {/* Metrics skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border-b border-zinc-800/50 last:border-0"
          >
            <div className="h-3 w-16 bg-zinc-800 rounded" />
            <div className="h-5 w-16 bg-zinc-800 rounded" />
            <div className="h-5 w-16 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
