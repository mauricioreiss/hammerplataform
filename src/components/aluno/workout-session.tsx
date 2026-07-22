"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { AlertTriangle, CheckCircle2, Clock, Loader2, Timer } from "lucide-react"
import type { Workout } from "@/lib/types"
import { finishWorkoutSession, type ExerciseLogInput } from "@/app/actions"
import { ExerciseItem } from "./exercise-item"
import { RestTimerModal } from "./rest-timer-modal"
import { parseRestTimeToSeconds } from "@/lib/rest-timer-utils"
import {
  parseSetsCount,
  saveSession,
  loadSession,
  clearSession,
  type PersistedSession,
} from "@/lib/workout-storage-utils"

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

// Load is mandatory: must be a number greater than 0.
function isValidWeight(raw: string | undefined): boolean {
  if (raw == null || raw.trim() === "") return false
  const n = Number(raw)
  return Number.isFinite(n) && n > 0
}

type RestTimerState = {
  duration: number
  /** Set-within-exercise context, e.g. "Série 2 de 4". Null when moving to a new exercise. */
  setContext: string | null
  nextExerciseId: string | null
  nextExerciseName: string | null
}

export function WorkoutSession({ workout, isCompleted = false }: WorkoutSessionProps) {
  const exercises = workout.exercises ?? []

  // ─── Hydrate state from localStorage on first render ────────────────────────
  const savedSession = useMemo<PersistedSession | null>(() => {
    if (isCompleted) return null
    return loadSession(workout.id)
  }, [workout.id, isCompleted])

  const [expandedId, setExpandedId] = useState<string | null>(
    savedSession?.expandedId ?? null,
  )
  /**
   * completedSets: { [exerciseId]: number[] }
   * Each array holds the 0-based set indices already finished.
   */
  const [completedSets, setCompletedSets] = useState<Record<string, number[]>>(
    savedSession?.completedSets ?? {},
  )
  // Per-exercise load (kg).
  const [weights, setWeights] = useState<Record<string, string>>(
    savedSession?.weights ?? {},
  )
  const [elapsed, setElapsed] = useState(savedSession?.elapsed ?? 0)
  const [finishing, setFinishing] = useState(false)
  const [finished, setFinished] = useState(false)
  // Exercise whose weight input should flash red after a failed check.
  const [errorId, setErrorId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [restTimer, setRestTimer] = useState<RestTimerState | null>(null)

  const sessionStartedAt = useRef(savedSession?.startedAt ?? new Date().toISOString())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Workout stopwatch ───────────────────────────────────────────────────────
  useEffect(() => {
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

  // ─── Auto-save to localStorage whenever key state changes ───────────────────
  // Using a ref for elapsed to avoid including it in the dependency array
  // (it changes every second and would make this effect extremely noisy).
  const elapsedRef = useRef(elapsed)
  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])

  const persistState = useCallback(() => {
    if (isCompleted) return
    saveSession({
      workoutId: workout.id,
      startedAt: sessionStartedAt.current,
      savedAt: Date.now(),
      elapsed: elapsedRef.current,
      completedSets,
      weights,
      expandedId,
    })
  }, [workout.id, completedSets, weights, expandedId, isCompleted])

  // Save on every meaningful state mutation.
  useEffect(() => {
    persistState()
  }, [persistState])

  // Save when the user navigates away or the tab goes to background.
  useEffect(() => {
    if (isCompleted) return
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") persistState()
    }
    const handlePageHide = () => persistState()
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("pagehide", handlePageHide)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("pagehide", handlePageHide)
    }
  }, [isCompleted, persistState])

  // ─── Derived state ───────────────────────────────────────────────────────────
  // An exercise is "fully done" when all its sets are completed.
  const completedExerciseIds = useMemo(() => {
    return exercises
      .filter((ex) => {
        const total = parseSetsCount(ex.sets)
        return (completedSets[ex.id]?.length ?? 0) >= total
      })
      .map((ex) => ex.id)
  }, [exercises, completedSets])

  const progress = useMemo(
    () => (exercises.length > 0 ? (completedExerciseIds.length / exercises.length) * 100 : 0),
    [completedExerciseIds.length, exercises.length],
  )

  const allCompletedHaveWeight = completedExerciseIds.every((id) => isValidWeight(weights[id]))

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function showToast(message: string) {
    setToast(message)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(null), 2500)
  }

  function closeRestTimer() {
    if (!restTimer) return
    const nextId = restTimer.nextExerciseId
    setRestTimer(null)
    if (nextId) setExpandedId(nextId)
  }

  // ─── Core: complete a single set ─────────────────────────────────────────────
  function handleCompleteSet(exerciseId: string, setIndex: number) {
    if (isCompleted) return

    // Guard: load is required before marking any set.
    if (!isValidWeight(weights[exerciseId])) {
      setErrorId(exerciseId)
      setExpandedId(exerciseId)
      showToast(WEIGHT_REQUIRED_MSG)
      return
    }

    setErrorId(null)

    const exercise = exercises.find((e) => e.id === exerciseId)
    if (!exercise) return

    const totalSets = parseSetsCount(exercise.sets)
    const prevDone = completedSets[exerciseId] ?? []

    // Guard: don't double-add the same set index.
    if (prevDone.includes(setIndex)) return

    const newDone = [...prevDone, setIndex]
    const newCompletedSets = { ...completedSets, [exerciseId]: newDone }
    setCompletedSets(newCompletedSets)

    const restDuration = parseRestTimeToSeconds(exercise.rest)
    const isLastSetOfExercise = newDone.length >= totalSets
    const exerciseIndex = exercises.findIndex((e) => e.id === exerciseId)

    if (!isLastSetOfExercise) {
      // Still more sets in this exercise.
      const nextSetNumber = setIndex + 2 // 1-based for display
      setRestTimer({
        duration: restDuration,
        setContext: `Série ${nextSetNumber} de ${totalSets}`,
        nextExerciseId: exerciseId,   // stay on same exercise
        nextExerciseName: null,
      })
    } else {
      // All sets done — find the next incomplete exercise.
      const newCompletedExerciseIds = exercises
        .filter((ex) => {
          const total = parseSetsCount(ex.sets)
          return (newCompletedSets[ex.id]?.length ?? 0) >= total
        })
        .map((ex) => ex.id)

      const nextExercise =
        exercises.find(
          (e, i) => i > exerciseIndex && !newCompletedExerciseIds.includes(e.id),
        ) ?? exercises.find((e) => !newCompletedExerciseIds.includes(e.id))

      setRestTimer({
        duration: restDuration,
        setContext: null,
        nextExerciseId: nextExercise?.id ?? null,
        nextExerciseName: nextExercise?.name ?? null,
      })
    }
  }

  function setWeight(exerciseId: string, value: string) {
    setWeights((prev) => ({ ...prev, [exerciseId]: value }))
    if (errorId === exerciseId && isValidWeight(value)) setErrorId(null)
  }

  async function handleFinish() {
    const invalid = completedExerciseIds.find((id) => !isValidWeight(weights[id]))
    if (invalid) {
      setErrorId(invalid)
      setExpandedId(invalid)
      showToast("Você esqueceu de anotar o peso em alguns exercícios!")
      return
    }

    setFinishing(true)
    const logs: ExerciseLogInput[] = completedExerciseIds.map((id) => ({
      exerciseId: id,
      weight: Number(weights[id]),
    }))
    const result = await finishWorkoutSession(workout.id, sessionStartedAt.current, logs)
    if (result.success) {
      if (timerRef.current) clearInterval(timerRef.current)
      clearSession(workout.id)
      setFinished(true)
    }
    setFinishing(false)
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="py-6 space-y-4 pb-32 md:pb-10 animate-in fade-in duration-300">
      {/* Workout header */}
      <div className="text-center mb-6 pt-2">
        <h1 className="text-4xl font-black italic text-red-600 uppercase tracking-tighter leading-none">
          {workout.title}
        </h1>

        {isCompleted ? (
          <button
            disabled
            className="mt-6 w-full bg-green-600/15 border border-green-600/40 text-green-500 font-black italic uppercase text-base py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-default"
          >
            <CheckCircle2 size={20} /> Treino Concluído
          </button>
        ) : (
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
            isCompleted={completedExerciseIds.includes(exercise.id)}
            completedSets={completedSets[exercise.id] ?? []}
            readOnly={isCompleted}
            weight={weights[exercise.id] ?? ""}
            weightValid={isValidWeight(weights[exercise.id])}
            hasError={errorId === exercise.id}
            onWeightChange={(value) => setWeight(exercise.id, value)}
            onToggleExpand={() =>
              setExpandedId(expandedId === exercise.id ? null : exercise.id)
            }
            onCompleteSet={(setIndex) => handleCompleteSet(exercise.id, setIndex)}
          />
        ))}
      </div>

      {/* Completion */}
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
              {finishing ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
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

      {/* Rest Timer Modal */}
      {restTimer && (
        <RestTimerModal
          totalSeconds={restTimer.duration}
          setContext={restTimer.setContext}
          nextExerciseName={restTimer.nextExerciseName}
          onComplete={closeRestTimer}
          onSkip={closeRestTimer}
        />
      )}
    </div>
  )
}
