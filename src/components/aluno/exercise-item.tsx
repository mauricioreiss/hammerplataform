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

type ExerciseItemProps = {
  exercise: Exercise
  isExpanded: boolean
  isCompleted: boolean
  weight: string
  // Whether the recorded load is valid (> 0). Gates marking the exercise done.
  weightValid: boolean
  onWeightChange: (value: string) => void
  onToggleExpand: () => void
  onToggleComplete: () => void
  // View-only: workout already finished this cycle, no toggling allowed.
  readOnly?: boolean
  // Tried to check the exercise without a valid load: flash the input red.
  hasError?: boolean
}

export function ExerciseItem({
  exercise,
  isExpanded,
  isCompleted,
  weight,
  weightValid,
  onWeightChange,
  onToggleExpand,
  onToggleComplete,
  readOnly = false,
  hasError = false,
}: ExerciseItemProps) {
  const [showHistory, setShowHistory] = useState(false)
  // Can't mark a not-yet-done exercise without a valid load. Unchecking an
  // already-done one stays allowed.
  const completeDisabled = readOnly || (!isCompleted && !weightValid)

  return (
    <div
      className={`border ${isCompleted ? "border-green-600/30 bg-green-950/10" : isExpanded ? "border-red-600 bg-zinc-900" : "border-zinc-800 bg-zinc-950"} rounded-2xl overflow-hidden transition-all duration-300`}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer active:bg-zinc-800/50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!completeDisabled) onToggleComplete()
            }}
            disabled={completeDisabled}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
              isCompleted
                ? "bg-green-600 border-green-600 text-white"
                : "border-zinc-600 text-transparent"
            } ${completeDisabled && !isCompleted ? "opacity-40 cursor-not-allowed" : ""} ${readOnly ? "cursor-default" : ""}`}
          >
            <CheckCircle2 size={18} />
          </button>
          <div className="flex-1">
            <h3
              className={`font-black uppercase tracking-wide text-sm leading-tight ${isCompleted ? "text-zinc-500 line-through" : "text-white"}`}
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
        className={`transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-[800px] opacity-100 border-t border-zinc-800/50" : "max-h-0 opacity-0"}`}
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

          {/* Evolução — own load history for this movement */}
          <button
            onClick={() => setShowHistory(true)}
            className="w-full py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 font-bold uppercase text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LineChart size={14} /> Evolução
          </button>

          {/* Complete button — hidden in read-only (workout already finished) */}
          {!readOnly && (
            <button
              onClick={onToggleComplete}
              disabled={completeDisabled}
              className={`w-full py-3 rounded-xl font-black italic uppercase text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                isCompleted
                  ? "bg-zinc-800 text-zinc-400"
                  : "bg-red-600 text-white"
              }`}
            >
              <CheckCircle2 size={18} />
              {isCompleted ? "Desmarcar" : !weightValid ? "Preencha a carga" : "Concluir Exercício"}
            </button>
          )}
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
