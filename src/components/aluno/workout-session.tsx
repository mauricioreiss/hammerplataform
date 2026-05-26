"use client"

import { useState, useMemo } from "react"
import { CheckCircle2 } from "lucide-react"
import type { WorkoutDay } from "@/lib/mock-data"
import { ExerciseItem } from "./exercise-item"

type WorkoutSessionProps = {
  workout: WorkoutDay
}

export function WorkoutSession({ workout }: WorkoutSessionProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [completedIds, setCompletedIds] = useState<number[]>([])

  const progress = useMemo(
    () => (completedIds.length / workout.exercises.length) * 100,
    [completedIds.length, workout.exercises.length],
  )

  function toggleComplete(id: number) {
    if (completedIds.includes(id)) {
      setCompletedIds(completedIds.filter((item) => item !== id))
    } else {
      setCompletedIds([...completedIds, id])
      const nextExercise = workout.exercises.find(
        (e) => e.id > id && !completedIds.includes(e.id),
      )
      setExpandedId(nextExercise?.id ?? null)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Workout header */}
      <div className="text-center mb-6 pt-2">
        <h1 className="text-4xl font-black italic text-red-600 uppercase tracking-tighter leading-none">
          {workout.title}
        </h1>
        <h2 className="text-sm font-bold uppercase mt-1 tracking-widest text-zinc-400">
          {workout.subtitle}
        </h2>

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
        {workout.exercises.map((exercise) => (
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
