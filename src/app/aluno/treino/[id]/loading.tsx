export default function TreinoDetalheLoading() {
  return (
    <div className="py-6 pb-24 md:pb-6 space-y-4 animate-pulse">
      {/* Workout title skeleton */}
      <div className="px-4">
        <div className="h-6 w-48 bg-zinc-800 rounded mb-2" />
        <div className="h-3 w-32 bg-zinc-800 rounded" />
      </div>

      {/* Exercise list skeleton */}
      <div className="space-y-3 px-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-md bg-zinc-800 shrink-0" />
            <div className="w-12 h-12 rounded-lg bg-zinc-800 shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 w-28 bg-zinc-800 rounded mb-2" />
              <div className="h-2.5 w-40 bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
