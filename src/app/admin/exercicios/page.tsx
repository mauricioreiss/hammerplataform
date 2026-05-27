import Link from "next/link"
import Image from "next/image"
import { Dumbbell, ChevronRight, ImageOff } from "lucide-react"
import { getExercises } from "./actions"
import { AddExerciseModal } from "@/components/admin/add-exercise-modal"
import { SeedExercisesButton } from "@/components/admin/seed-exercises-button"

export default async function ExerciciosPage() {
  const exercises = await getExercises()

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in pb-24">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} className="text-red-600" />
          <h2 className="text-lg font-black italic text-white uppercase tracking-tight">
            Exercícios
          </h2>
        </div>
        <AddExerciseModal />
      </div>

      <p className="text-zinc-400 text-xs">
        Biblioteca de exercícios. Clique para adicionar ou alterar a ilustração.
      </p>

      {exercises.length === 0 && (
        <div className="text-center pt-16 space-y-6">
          <div>
            <Dumbbell size={48} className="mx-auto mb-4 text-zinc-700" />
            <p className="text-zinc-500 text-sm font-bold uppercase">
              Nenhum exercício cadastrado
            </p>
            <p className="text-zinc-600 text-xs mt-1">
              Adicione exercícios manualmente ou popule com os padrões.
            </p>
          </div>
          <SeedExercisesButton />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {exercises.map((exercise) => (
          <Link
            key={exercise.id}
            href={`/admin/exercicios/${exercise.id}`}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden active:scale-95 transition-transform block hover:border-zinc-700"
          >
            <div className="aspect-square bg-zinc-950 relative flex items-center justify-center">
              {exercise.illustration_url ? (
                <Image
                  src={exercise.illustration_url}
                  alt={exercise.name}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <ImageOff size={32} className="text-zinc-700" />
              )}
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-xs truncate uppercase">
                  {exercise.name}
                </p>
                <p className="text-[9px] text-zinc-500 mt-0.5 uppercase font-bold">
                  {exercise.muscle_group ?? "—"}
                </p>
              </div>
              <ChevronRight size={14} className="text-zinc-600 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
