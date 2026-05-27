import { WorkoutSession } from "@/components/aluno/workout-session"
import { getWorkoutsDoAluno, getWorkoutComExercicios, getExerciseLogs } from "@/app/actions"

export default async function TreinoPage() {
  const workouts = await getWorkoutsDoAluno()
  const latest = workouts[0]

  if (!latest) {
    return (
      <div className="p-4 md:p-6 pb-24 animate-in fade-in duration-300">
        <div className="text-center pt-16">
          <p className="text-zinc-500 text-sm font-bold uppercase">
            Nenhum treino disponível
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            Aguarde o treinador montar sua ficha.
          </p>
        </div>
      </div>
    )
  }

  const [workout, completedIds] = await Promise.all([
    getWorkoutComExercicios(latest.id),
    getExerciseLogs(latest.id),
  ])

  if (!workout || !workout.exercises?.length) {
    return (
      <div className="p-4 md:p-6 pb-24 animate-in fade-in duration-300">
        <div className="text-center pt-16">
          <p className="text-zinc-500 text-sm font-bold uppercase">
            Treino sem exercícios
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            Aguarde o treinador adicionar exercícios.
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
