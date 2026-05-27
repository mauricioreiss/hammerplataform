import { redirect } from "next/navigation"
import { getWorkoutsDoAluno } from "@/app/actions"

export default async function TreinoPage() {
  const workouts = await getWorkoutsDoAluno()
  const latest = workouts[0]

  if (!latest) {
    return (
      <div className="py-6 pb-24 md:pb-6 animate-in fade-in duration-300">
        <div className="text-center pt-16">
          <p className="text-zinc-500 text-sm font-bold uppercase">
            Nenhum treino disponivel
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            Aguarde o treinador montar sua ficha.
          </p>
        </div>
      </div>
    )
  }

  redirect(`/aluno/treino/${latest.id}`)
}
