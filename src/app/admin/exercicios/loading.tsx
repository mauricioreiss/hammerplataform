export default function ExerciciosLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="h-5 w-32 bg-zinc-800 rounded mb-2" />
      <div className="h-3 w-64 bg-zinc-800 rounded" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >
            <div className="aspect-square bg-zinc-950" />
            <div className="p-3">
              <div className="h-3 w-full bg-zinc-800 rounded mb-1" />
              <div className="h-2 w-12 bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
