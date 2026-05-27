import Link from "next/link"
import { Zap } from "lucide-react"
import type { Workout } from "@/lib/types"

type WorkoutDayCardProps = {
  workout: Workout
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
          <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">
            {workout.exercises?.length ?? 0} exercícios
          </p>
        </div>
        {workout.status && (
          <span className="bg-zinc-950 text-zinc-400 px-2 py-1 rounded text-[10px] font-bold border border-zinc-800 uppercase">
            {workout.status}
          </span>
        )}
      </div>
      <div className="w-full bg-red-600 text-white font-black italic uppercase py-3 rounded-xl flex items-center justify-center gap-2">
        <Zap size={18} /> Iniciar Treino
      </div>
    </Link>
  )
}
