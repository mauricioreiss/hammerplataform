"use client"

import { useState } from "react"
import Image from "next/image"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ImageOff,
} from "lucide-react"
import type { Exercise } from "@/lib/types"

type ExerciseItemProps = {
  exercise: Exercise
  isExpanded: boolean
  isCompleted: boolean
  onToggleExpand: () => void
  onToggleComplete: () => void
  // View-only: workout already finished this cycle, no toggling allowed.
  readOnly?: boolean
}

export function ExerciseItem({
  exercise,
  isExpanded,
  isCompleted,
  onToggleExpand,
  onToggleComplete,
  readOnly = false,
}: ExerciseItemProps) {
  const [weight, setWeight] = useState("")

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
              if (!readOnly) onToggleComplete()
            }}
            disabled={readOnly}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
              isCompleted
                ? "bg-green-600 border-green-600 text-white"
                : "border-zinc-600 text-transparent"
            } ${readOnly ? "cursor-default" : ""}`}
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
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2 relative">
              <label className="text-[9px] uppercase font-bold text-zinc-500 absolute top-2 left-3">
                Carga Hoje (Kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-transparent border-none text-white focus:outline-none font-black text-lg text-center mt-4 pb-1"
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

          {/* Complete button — hidden in read-only (workout already finished) */}
          {!readOnly && (
            <button
              onClick={onToggleComplete}
              className={`w-full py-3 rounded-xl font-black italic uppercase text-sm flex items-center justify-center gap-2 transition-colors ${
                isCompleted
                  ? "bg-zinc-800 text-zinc-400"
                  : "bg-red-600 text-white"
              }`}
            >
              <CheckCircle2 size={18} />
              {isCompleted ? "Desmarcar" : "Concluir Exercício"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
