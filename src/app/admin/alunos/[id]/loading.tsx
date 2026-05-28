export default function StudentDetailLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      {/* Student header skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-zinc-800" />
        <div className="flex-1">
          <div className="h-5 w-40 bg-zinc-800 rounded mb-2" />
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-zinc-800 rounded-full" />
            <div className="h-5 w-20 bg-zinc-800 rounded-full" />
          </div>
        </div>
      </div>

      {/* Quick stats skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="h-2 w-20 bg-zinc-800 rounded mb-2" />
            <div className="h-5 w-16 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-4 border-b border-zinc-800 pb-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-20 bg-zinc-800 rounded" />
        ))}
      </div>

      {/* Workout cards skeleton */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
              <div className="h-4 w-32 bg-zinc-800 rounded" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-3 w-full bg-zinc-800 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
