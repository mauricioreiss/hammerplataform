export default function ConfiguracoesLoading() {
  return (
    <div className="p-4 md:p-6 space-y-10 animate-pulse">
      {/* Title */}
      <div>
        <div className="h-5 w-36 bg-zinc-800 rounded mb-6" />

        {/* Settings form skeleton */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800" />
            <div className="h-8 w-28 bg-zinc-800 rounded-xl" />
          </div>
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="h-2.5 w-20 bg-zinc-800 rounded mb-2" />
              <div className="h-11 w-full bg-zinc-800 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Plans section skeleton */}
      <div className="border-t border-zinc-800 pt-10">
        <div className="h-5 w-28 bg-zinc-800 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between"
            >
              <div>
                <div className="h-3.5 w-24 bg-zinc-800 rounded mb-2" />
                <div className="h-2.5 w-32 bg-zinc-800 rounded" />
              </div>
              <div className="h-5 w-20 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
