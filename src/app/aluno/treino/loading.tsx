export default function TreinoLoading() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="text-center mb-6 pt-2">
        <div className="h-10 w-48 bg-zinc-800 rounded mx-auto mb-2" />
        <div className="h-3 w-32 bg-zinc-800 rounded mx-auto" />
        <div className="mt-6 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
          <div className="h-2 w-full bg-zinc-800 rounded" />
        </div>
      </div>

      {/* Exercise list skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="h-4 w-40 bg-zinc-800 rounded mb-2" />
            <div className="h-3 w-24 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
