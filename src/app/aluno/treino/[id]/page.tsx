import { notFound } from "next/navigation"
import { WorkoutSession } from "@/components/aluno/workout-session"
import { getWorkoutComExercicios, getExerciseLogs } from "@/app/actions"

type Props = {
  params: Promise<{ id: string }>
}

export default async function TreinoDetalhePage({ params }: Props) {
  const { id } = await params

  const [workout, completedIds] = await Promise.all([
    getWorkoutComExercicios(id),
    getExerciseLogs(id),
  ])

  if (!workout) return notFound()

  if (!workout.exercises?.length) {
    return (
      <div className="py-6 pb-24 md:pb-6 animate-in fade-in duration-300">
        <div className="text-center pt-16">
          <p className="text-zinc-500 text-sm font-bold uppercase">
            Treino sem exercicios
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            Aguarde o treinador adicionar exercicios.
          </p>
        </div>
      </div>
    )
  }

  return (
    <WorkoutSession
      workout={workout}
      initialCompletedIds={completedIds}
    />
  )
}
