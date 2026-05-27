import Link from "next/link"
import { Scale, ChevronDown } from "lucide-react"
import { getCurrentUser, getWorkoutsDoAluno } from "@/app/actions"
import { PaymentAlert } from "@/components/aluno/payment-alert"
import { WorkoutDayCard } from "@/components/aluno/workout-day-card"
import { InstallPrompt } from "@/components/aluno/install-prompt"

export default async function AlunoPage() {
  const [user, workouts] = await Promise.all([
    getCurrentUser(),
    getWorkoutsDoAluno(),
  ])

  const firstName = user?.full_name.split(" ")[0] ?? "Aluno"
  const hasAlert = user?.plan_status === "vencendo" || user?.plan_status === "atrasado"
  const latestWorkout = workouts[0] ?? null

  return (
    <div className="py-6 space-y-6 pb-24 md:pb-6 animate-in fade-in duration-300">
      {/* Greeting */}
      <div>
        <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">
          Bom dia,
        </p>
        <h2 className="text-3xl font-black text-white uppercase">
          {firstName}
        </h2>
      </div>

      {/* Install PWA prompt */}
      <InstallPrompt />

      {/* Payment alert */}
      {hasAlert && <PaymentAlert />}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's workout */}
        <div>
          <h3 className="text-zinc-500 font-bold uppercase text-xs mb-3 tracking-wider">
            Treino de Hoje
          </h3>
          {latestWorkout ? (
            <WorkoutDayCard workout={latestWorkout} />
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-center">
              <p className="text-zinc-500 text-sm">Nenhum treino disponivel.</p>
              <p className="text-zinc-600 text-xs mt-1">Aguarde o treinador montar sua ficha.</p>
            </div>
          )}
        </div>

        {/* Evolution link */}
        <div>
          <h3 className="text-zinc-500 font-bold uppercase text-xs mb-3 tracking-wider md:block hidden">
            Acompanhamento
          </h3>
          <Link
            href="/aluno/evolucao"
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between active:bg-zinc-800 hover:border-zinc-700 transition-colors block h-full"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                <Scale size={18} className="text-zinc-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm uppercase">
                  Avaliacao Fisica
                </p>
                <p className="text-zinc-500 text-[10px] uppercase font-bold">
                  Ver seus resultados mais recentes
                </p>
              </div>
            </div>
            <ChevronDown size={20} className="text-zinc-600 -rotate-90" />
          </Link>
        </div>
      </div>
    </div>
  )
}
