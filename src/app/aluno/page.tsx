import Link from "next/link"
import { Scale, ChevronDown } from "lucide-react"
import { currentUser, todayWorkout } from "@/lib/mock-data"
import { PaymentAlert } from "@/components/aluno/payment-alert"
import { WorkoutDayCard } from "@/components/aluno/workout-day-card"

export default function AlunoPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Greeting */}
      <div>
        <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">
          Bom dia,
        </p>
        <h2 className="text-3xl font-black text-white uppercase">
          {currentUser.name}
        </h2>
      </div>

      {/* Payment alert */}
      {currentUser.status === "vencendo" && (
        <PaymentAlert daysLeft={currentUser.daysLeft} />
      )}

      {/* Today's workout */}
      <div>
        <h3 className="text-zinc-500 font-bold uppercase text-xs mb-3 tracking-wider">
          Treino de Hoje
        </h3>
        <WorkoutDayCard workout={todayWorkout} />
      </div>

      {/* Evolution link */}
      <Link
        href="/aluno/evolucao"
        className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between active:bg-zinc-800 transition-colors block"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
            <Scale size={18} className="text-zinc-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm uppercase">
              Avaliação Física
            </p>
            <p className="text-zinc-500 text-[10px] uppercase font-bold">
              Ver seus resultados mais recentes
            </p>
          </div>
        </div>
        <ChevronDown size={20} className="text-zinc-600 -rotate-90" />
      </Link>
    </div>
  )
}
