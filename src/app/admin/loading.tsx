export default function AdminLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      {/* KPI skeleton */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div className="h-3 w-32 bg-zinc-800 rounded mb-3" />
        <div className="h-8 w-40 bg-zinc-800 rounded mb-4" />
        <div className="flex justify-between pt-4 border-t border-zinc-800">
          <div>
            <div className="h-2 w-20 bg-zinc-800 rounded mb-2" />
            <div className="h-6 w-10 bg-zinc-800 rounded" />
          </div>
          <div>
            <div className="h-2 w-20 bg-zinc-800 rounded mb-2" />
            <div className="h-6 w-10 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>

      {/* Queue skeleton */}
      <div>
        <div className="h-3 w-36 bg-zinc-800 rounded mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800" />
              <div className="flex-1">
                <div className="h-3 w-28 bg-zinc-800 rounded mb-2" />
                <div className="h-2 w-20 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
