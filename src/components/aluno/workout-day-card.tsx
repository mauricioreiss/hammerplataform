import Link from "next/link"
import { Clock, Zap } from "lucide-react"
import type { WorkoutDay } from "@/lib/mock-data"

type WorkoutDayCardProps = {
  workout: WorkoutDay
}

export function WorkoutDayCard({ workout }: WorkoutDayCardProps) {
  return (
    <Link
      href="/aluno/treino"
      className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden block shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl" />
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-red-600 font-black italic text-2xl uppercase tracking-tighter leading-none">
            {workout.title}
          </p>
          <p className="text-white font-bold text-sm mt-1 uppercase">
            {workout.subtitle}
          </p>
        </div>
        <span className="bg-zinc-950 text-zinc-400 px-2 py-1 rounded text-[10px] font-bold border border-zinc-800 flex items-center gap-1">
          <Clock size={10} /> {workout.duration}
        </span>
      </div>
      <div className="w-full bg-red-600 text-white font-black italic uppercase py-3 rounded-xl flex items-center justify-center gap-2">
        <Zap size={18} /> Iniciar Treino
      </div>
    </Link>
  )
}
