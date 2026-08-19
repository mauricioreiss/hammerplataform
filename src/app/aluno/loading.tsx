export default function AlunoLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      {/* Greeting skeleton */}
      <div>
        <div className="h-3 w-20 bg-zinc-800 rounded mb-2" />
        <div className="h-8 w-40 bg-zinc-800 rounded" />
      </div>

      {/* Workout card skeleton */}
      <div>
        <div className="h-3 w-28 bg-zinc-800 rounded mb-3" />
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="h-5 w-32 bg-zinc-800 rounded mb-2" />
          <div className="h-3 w-24 bg-zinc-800 rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 w-full bg-zinc-800 rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Evolution link skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 bg-zinc-800 rounded-full" />
        <div className="flex-1">
          <div className="h-3 w-28 bg-zinc-800 rounded mb-2" />
          <div className="h-2 w-40 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}
