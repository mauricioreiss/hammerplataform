export default function AlunosLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      {/* Search skeleton */}
      <div className="h-12 bg-zinc-900 border border-zinc-800 rounded-xl mb-6" />

      {/* Student list skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800" />
            <div className="flex-1">
              <div className="h-3 w-32 bg-zinc-800 rounded mb-2" />
              <div className="h-2 w-24 bg-zinc-800 rounded" />
            </div>
            <div className="h-5 w-16 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
