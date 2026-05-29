"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { AlertTriangle, CheckCircle2, Clock, Loader2, Timer } from "lucide-react"
import type { Workout } from "@/lib/types"
import { finishWorkoutSession, type ExerciseLogInput } from "@/app/actions"
import { ExerciseItem } from "./exercise-item"

const WEIGHT_REQUIRED_MSG = "Preencha a carga utilizada nesta série."

type WorkoutSessionProps = {
  workout: Workout
  // Already finished this weekly cycle: lock the timer and execution,
  // student can only view the sheet.
  isCompleted?: boolean
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// Load is mandatory: must be a number greater than 0. Empty, null,
// non-numeric or <= 0 all count as missing.
function isValidWeight(raw: string | undefined): boolean {
  if (raw == null || raw.trim() === "") return false
  const n = Number(raw)
  return Number.isFinite(n) && n > 0
}

export function WorkoutSession({ workout, isCompleted = false }: WorkoutSessionProps) {
  const exercises = workout.exercises ?? []
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  // Per-exercise load (kg), kept in memory until the workout is finished.
  const [weights, setWeights] = useState<Record<string, string>>({})
  const [elapsed, setElapsed] = useState(0)
  const [finishing, setFinishing] = useState(false)
  const [finished, setFinished] = useState(false)
  // Exercise whose weight input should flash red after a failed check.
  const [errorId, setErrorId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const sessionStartedAt = useRef(new Date().toISOString())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Locked workout: never run the timer, it's view-only.
    if (isCompleted) return
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isCompleted])

  useEffect(() => {
    return () => {
      if (toastRef.current) clearTimeout(toastRef.current)
    }
  }, [])

  const progress = useMemo(
    () => exercises.length > 0 ? (completedIds.length / exercises.length) * 100 : 0,
    [completedIds.length, exercises.length],
  )

  // Fallback gate: every completed exercise must carry a valid load.
  const allCompletedHaveWeight = completedIds.every((id) => isValidWeight(weights[id]))

  function showToast(message: string) {
    setToast(message)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), 2500)
  }

  function toggleComplete(exerciseId: string) {
    if (isCompleted) return // locked: no execution on a finished workout

    const isDone = completedIds.includes(exerciseId)

    // Unmarking is always allowed.
    if (isDone) {
      setCompletedIds(completedIds.filter((id) => id !== exerciseId))
      return
    }

    // Guard: can't mark an exercise done without recording its load.
    if (!isValidWeight(weights[exerciseId])) {
      setErrorId(exerciseId)
      setExpandedId(exerciseId)
      showToast(WEIGHT_REQUIRED_MSG)
      return
    }

    setErrorId(null)
    setCompletedIds([...completedIds, exerciseId])
    const currentIndex = exercises.findIndex((e) => e.id === exerciseId)
    const nextExercise = exercises.find(
      (e, i) => i > currentIndex && !completedIds.includes(e.id),
    )
    setExpandedId(nextExercise?.id ?? null)
  }

  function setWeight(exerciseId: string, value: string) {
    setWeights((prev) => ({ ...prev, [exerciseId]: value }))
    // Clear the error as soon as the student types a valid value.
    if (errorId === exerciseId && isValidWeight(value)) setErrorId(null)
  }

  async function handleFinish() {
    // Hard guard: block the Supabase submit if any completed exercise is
    // missing a valid load. First line of the handler, before anything else.
    const invalid = completedIds.find((id) => !isValidWeight(weights[id]))
    if (invalid) {
      setErrorId(invalid)
      setExpandedId(invalid)
      showToast("Você esqueceu de anotar o peso em alguns exercícios!")
      return
    }

    setFinishing(true)
    // One log per completed exercise, with the load the student recorded.
    const logs: ExerciseLogInput[] = completedIds.map((id) => ({
      exerciseId: id,
      weight: Number(weights[id]),
    }))
    const result = await finishWorkoutSession(workout.id, sessionStartedAt.current, logs)
    if (result.success) {
      if (timerRef.current) clearInterval(timerRef.current)
      setFinished(true)
    }
    setFinishing(false)
  }

  return (
    <div className="py-6 space-y-4 pb-24 md:pb-6 animate-in fade-in duration-300">
      {/* Workout header */}
      <div className="text-center mb-6 pt-2">
        <h1 className="text-4xl font-black italic text-red-600 uppercase tracking-tighter leading-none">
          {workout.title}
        </h1>

        {/* Completed this cycle: locked banner instead of the live timer */}
        {isCompleted ? (
          <button
            disabled
            className="mt-6 w-full bg-green-600/15 border border-green-600/40 text-green-500 font-black italic uppercase text-base py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-default"
          >
            <CheckCircle2 size={20} /> Treino Concluído
          </button>
        ) : (
          /* Timer + Progress */
          <div className="mt-6 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
            <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
              <span className="text-zinc-400">Progresso do Treino</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-zinc-400">
                  <Timer size={10} />
                  {formatDuration(elapsed)}
                </span>
                <span className="text-red-500">{Math.round(progress)}%</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            isExpanded={expandedId === exercise.id}
            isCompleted={completedIds.includes(exercise.id)}
            readOnly={isCompleted}
            weight={weights[exercise.id] ?? ""}
            weightValid={isValidWeight(weights[exercise.id])}
            hasError={errorId === exercise.id}
            onWeightChange={(value) => setWeight(exercise.id, value)}
            onToggleExpand={() =>
              setExpandedId(expandedId === exercise.id ? null : exercise.id)
            }
            onToggleComplete={() => toggleComplete(exercise.id)}
          />
        ))}
      </div>

      {/* Completion — never shown on a locked (already finished) workout */}
      {!isCompleted && progress === 100 && (
        <div className="pt-6 animate-in slide-in-from-bottom-4">
          {finished ? (
            <div className="w-full bg-green-600 text-white font-black italic uppercase text-xl py-4 rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.3)] flex items-center justify-center gap-2">
              <CheckCircle2 size={24} /> Treino Finalizado!
            </div>
          ) : (
            <button
              onClick={handleFinish}
              disabled={finishing || !allCompletedHaveWeight}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-black italic uppercase text-xl py-4 rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {finishing ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <CheckCircle2 size={24} />
              )}
              {finishing ? "Salvando..." : "Finalizar Treino"}
            </button>
          )}
          {finished && (
            <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <p className="text-zinc-400 text-xs">
                <Clock size={12} className="inline mr-1" />
                Tempo total: <strong className="text-white">{formatDuration(elapsed)}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Validation toast */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-red-600 text-white text-xs font-bold rounded-xl px-4 py-3 shadow-lg flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
