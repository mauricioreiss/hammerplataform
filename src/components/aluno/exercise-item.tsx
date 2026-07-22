"use client"

import { useState } from "react"
import Image from "next/image"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ImageOff,
  LineChart,
} from "lucide-react"
import type { Exercise } from "@/lib/types"
import { ExerciseHistoryModal } from "./exercise-history-modal"
import { parseSetsCount } from "@/lib/workout-storage-utils"

type ExerciseItemProps = {
  exercise: Exercise
  isExpanded: boolean
  /** All sets of this exercise are done. */
  isCompleted: boolean
  /** 0-based indices of sets already completed. */
  completedSets: number[]
  weight: string
  // Whether the recorded load is valid (> 0). Gates marking a set done.
  weightValid: boolean
  onWeightChange: (value: string) => void
  onToggleExpand: () => void
  /** Called when the student taps a set chip to mark it as done. */
  onCompleteSet: (setIndex: number) => void
  // View-only: workout already finished this cycle, no toggling allowed.
  readOnly?: boolean
  // Tried to check the exercise without a valid load: flash the input red.
  hasError?: boolean
}

export function ExerciseItem({
  exercise,
  isExpanded,
  isCompleted,
  completedSets,
  weight,
  weightValid,
  onWeightChange,
  onToggleExpand,
  onCompleteSet,
  readOnly = false,
  hasError = false,
}: ExerciseItemProps) {
  const [showHistory, setShowHistory] = useState(false)
  const totalSets = parseSetsCount(exercise.sets)
  // The next set to be completed is the first one not yet in completedSets.
  const nextSetIndex = Array.from({ length: totalSets }).findIndex(
    (_, i) => !completedSets.includes(i),
  )
  const allSetsCompleted = completedSets.length >= totalSets

  return (
    <div
      className={`border ${allSetsCompleted ? "border-green-600/30 bg-green-950/10" : isExpanded ? "border-red-600 bg-zinc-900" : "border-zinc-800 bg-zinc-950"} rounded-2xl overflow-hidden transition-all duration-300`}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer active:bg-zinc-800/50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 w-full">
          {/* Completion indicator — shows total progress as fraction */}
          <div
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              allSetsCompleted
                ? "bg-green-600 border-green-600 text-white"
                : "border-zinc-600 text-zinc-600"
            }`}
          >
            {allSetsCompleted ? (
              <CheckCircle2 size={18} />
            ) : (
              <span className="text-[10px] font-black leading-none">
                {completedSets.length}/{totalSets}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`font-black uppercase tracking-wide text-sm leading-tight ${allSetsCompleted ? "text-zinc-500 line-through" : "text-white"}`}
            >
              {exercise.name}
            </h3>
            <p className="text-zinc-500 font-bold text-[10px] mt-0.5 uppercase tracking-wider">
              <span className="text-red-500">{exercise.sets ?? "—"}</span> SÉRIES
              <span className="mx-1">&bull;</span>
              <span className="text-red-500">{exercise.reps ?? "—"}</span> REPS
            </p>
          </div>
          <div className="text-zinc-500 shrink-0">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <div
        className={`transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-[900px] opacity-100 border-t border-zinc-800/50" : "max-h-0 opacity-0"}`}
      >
        <div className="p-4 space-y-4">
          {/* Exercise illustration */}
          <div className="relative aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
            {exercise.illustration_url ? (
              <Image
                src={exercise.illustration_url}
                alt={exercise.name}
                fill
                unoptimized
                className="object-contain p-2"
                sizes="(max-width: 768px) 90vw, 400px"
              />
            ) : (
              <ImageOff size={32} className="text-zinc-700" />
            )}
          </div>

          {/* Tip */}
          {exercise.note && (
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed uppercase">
                <strong className="text-red-500 block mb-1">Atenção:</strong>
                {exercise.note}
              </p>
            </div>
          )}

          {/* Weight + rest */}
          <div className="flex gap-3">
            <div
              className={`flex-1 bg-zinc-950 border rounded-xl p-2 relative transition-colors ${
                hasError ? "border-red-500 ring-1 ring-red-500" : "border-zinc-800"
              }`}
            >
              <label className={`text-[9px] uppercase font-bold absolute top-2 left-3 ${hasError ? "text-red-500" : "text-zinc-500"}`}>
                Carga Hoje (Kg)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => onWeightChange(e.target.value)}
                disabled={readOnly}
                className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 font-black text-lg text-center mt-4 pb-1 disabled:text-zinc-500"
                placeholder="--"
              />
            </div>
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2 relative flex flex-col items-center justify-center">
              <label className="text-[9px] uppercase font-bold text-zinc-500 absolute top-2 left-3">
                Descanso
              </label>
              <div className="flex items-center gap-1 text-zinc-300 font-black text-lg mt-4 pb-1">
                <Clock size={14} className="text-zinc-500" /> {exercise.rest ?? "60s"}
              </div>
            </div>
          </div>

          {/* ── Series chips ── */}
          {!readOnly && (
            <div>
              <p className="text-[9px] uppercase font-bold text-zinc-500 mb-2 tracking-wider">
                Séries — toque para concluir
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: totalSets }).map((_, i) => {
                  const isDone = completedSets.includes(i)
                  const isNext = i === nextSetIndex && !allSetsCompleted
                  return (
                    <button
                      key={i}
                      disabled={
                        // Can only complete the next sequential set, not random ones.
                        // Already-done sets are not re-clickable; future sets are locked.
                        isDone || (!isNext) || !weightValid
                      }
                      aria-label={`Série ${i + 1}${isDone ? " (concluída)" : ""}`}
                      onClick={() => onCompleteSet(i)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all active:scale-95 border
                        ${isDone
                          ? "bg-green-600/20 border-green-600/40 text-green-400 cursor-default"
                          : isNext && weightValid
                          ? "bg-red-600 border-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]"
                          : "bg-zinc-950 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
                        }`}
                    >
                      {isDone && <CheckCircle2 size={12} />}
                      Série {i + 1}
                    </button>
                  )
                })}
              </div>
              {!weightValid && !allSetsCompleted && (
                <p className="text-[9px] text-red-500 font-bold uppercase mt-2">
                  Preencha a carga antes de marcar a série.
                </p>
              )}
            </div>
          )}

          {/* Evolução */}
          <button
            onClick={() => setShowHistory(true)}
            className="w-full py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 font-bold uppercase text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LineChart size={14} /> Evolução
          </button>
        </div>
      </div>

      {showHistory && (
        <ExerciseHistoryModal
          exerciseId={exercise.id}
          exerciseName={exercise.name}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}
