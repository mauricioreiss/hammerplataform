"use client"

import { useState, useMemo, useTransition } from "react"
import { CheckCircle2 } from "lucide-react"
import type { Workout } from "@/lib/types"
import { toggleExerciseLog } from "@/app/actions"
import { ExerciseItem } from "./exercise-item"

type WorkoutSessionProps = {
  workout: Workout
  initialCompletedIds: string[]
}

export function WorkoutSession({ workout, initialCompletedIds }: WorkoutSessionProps) {
  const exercises = workout.exercises ?? []
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds)
  const [, startTransition] = useTransition()

  const progress = useMemo(
    () => exercises.length > 0 ? (completedIds.length / exercises.length) * 100 : 0,
    [completedIds.length, exercises.length],
  )

  function toggleComplete(exerciseId: string) {
    const isCompleted = completedIds.includes(exerciseId)

    if (isCompleted) {
      setCompletedIds(completedIds.filter((id) => id !== exerciseId))
    } else {
      setCompletedIds([...completedIds, exerciseId])
      const currentIndex = exercises.findIndex((e) => e.id === exerciseId)
      const nextExercise = exercises.find(
        (e, i) => i > currentIndex && !completedIds.includes(e.id),
      )
      setExpandedId(nextExercise?.id ?? null)
    }

    startTransition(() => {
      toggleExerciseLog(exerciseId, workout.id)
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Workout header */}
      <div className="text-center mb-6 pt-2">
        <h1 className="text-4xl font-black italic text-red-600 uppercase tracking-tighter leading-none">
          {workout.title}
        </h1>

        {/* Progress bar */}
        <div className="mt-6 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
          <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
            <span className="text-zinc-400">Progresso do Treino</span>
            <span className="text-red-500">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            isExpanded={expandedId === exercise.id}
            isCompleted={completedIds.includes(exercise.id)}
            onToggleExpand={() =>
              setExpandedId(expandedId === exercise.id ? null : exercise.id)
            }
            onToggleComplete={() => toggleComplete(exercise.id)}
          />
        ))}
      </div>

      {/* Completion */}
      {progress === 100 && (
        <div className="pt-6 animate-in slide-in-from-bottom-4">
          <button className="w-full bg-green-600 text-white font-black italic uppercase text-xl py-4 rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all">
            <CheckCircle2 size={24} /> Treino Finalizado!
          </button>
        </div>
      )}
    </div>
  )
}
