import { ChevronRight } from "lucide-react"

type LandingHeroProps = {
  onStart: () => void
}

export function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <div className="relative h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-zinc-800">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 grayscale mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="flex items-center mb-8">
          <span className="font-black italic text-7xl text-white tracking-tighter drop-shadow-2xl">
            F<span className="-ml-2 text-zinc-300">H</span>
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
          Construa seu <span className="text-red-600">Melhor Físico</span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-lg uppercase font-bold tracking-widest mb-10 max-w-lg">
          Disciplina. Foco. Constância.
          <br />
          O resultado é consequência.
        </p>

        <button
          onClick={onStart}
          className="w-full max-w-md bg-red-600 hover:bg-red-700 text-white font-black italic uppercase py-5 rounded-xl text-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_40px_rgba(220,38,38,0.4)]"
        >
          Quero a Consultoria <ChevronRight size={24} />
        </button>
      </div>
    </div>
  )
}
