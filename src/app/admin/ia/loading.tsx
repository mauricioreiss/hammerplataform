export default function IALoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="h-5 w-24 bg-zinc-800 rounded mb-2" />
      <div className="h-3 w-56 bg-zinc-800 rounded" />

      {/* List skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800" />
            <div className="flex-1">
              <div className="h-3 w-36 bg-zinc-800 rounded mb-2" />
              <div className="flex gap-2">
                <div className="h-4 w-12 bg-zinc-800 rounded" />
                <div className="h-4 w-14 bg-zinc-800 rounded" />
                <div className="h-4 w-16 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
