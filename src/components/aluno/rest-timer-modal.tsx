"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Pause, SkipForward, Timer, Dumbbell, Zap } from "lucide-react"
import { formatTimerSeconds } from "@/lib/rest-timer-utils"

type RestTimerModalProps = {
  totalSeconds: number
  nextExerciseName?: string | null
  onComplete: () => void
  onSkip: () => void
}

export function RestTimerModal({
  totalSeconds,
  nextExerciseName,
  onComplete,
  onSkip,
}: RestTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Guard ref: prevents onComplete from firing more than once if the interval
  // fires an extra tick before React processes the component unmount.
  const completedRef = useRef(false)

  // Stable callback wrapper so the interval effect does not re-run on every
  // render of the parent (closeRestTimer is a plain function, not memoized).
  const stableOnComplete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    onComplete()
  }, [onComplete])

  // Countdown timer logic
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          // Call outside setState to avoid batching surprises
          setTimeout(stableOnComplete, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, stableOnComplete])

  // Progress percentage (0% at start, 100% at end)
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 1
  const progressPercentage = Math.min(100, Math.max(0, progressRatio * 100))

  // Analog hand angle in degrees (0 to 360)
  const handAngle = progressRatio * 360

  // SVG Circular progress dimensions
  const size = 240
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference

  const isWarning = timeLeft <= 5 && timeLeft > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden flex flex-col items-center">
        {/* Top ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-black italic uppercase tracking-wider mb-5">
          {/* animate-spin is Tailwind core; spin-slow doesn't exist by default */}
          <Timer size={14} />
          Tempo de Descanso
        </div>

        {/* Analog Clock / Circular Timer */}
        <div className="relative my-2 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            {/* Outer Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="stroke-zinc-900"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className={`transition-all duration-1000 ease-linear ${
                isWarning ? "stroke-red-500" : "stroke-red-600"
              }`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Analog Dial Ticks (12 main markers) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => {
              const rotation = i * 30
              const isMajor = i % 3 === 0
              return (
                <div
                  key={i}
                  className="absolute w-full h-full flex justify-center pt-2"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <div
                    className={`${
                      isMajor ? "w-0.5 h-3 bg-zinc-400" : "w-0.5 h-1.5 bg-zinc-700"
                    } rounded-full`}
                  />
                </div>
              )
            })}
          </div>

          {/* Analog Rotating Hand */}
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center transition-transform duration-1000 ease-linear"
            style={{ transform: `rotate(${handAngle}deg)` }}
          >
            <div className="w-full h-full relative flex items-center justify-center">
              {/* Hand pointer stem pointing up */}
              <div className="absolute top-7 w-1 h-[75px] bg-gradient-to-t from-red-600 to-red-400 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              {/* Hand tip dot */}
              <div className="absolute top-5 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
            </div>
          </div>

          {/* Center Center Knob & Digital Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Center Pivot Dot */}
            <div className="w-4 h-4 bg-zinc-950 border-2 border-red-500 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)] mb-1 z-10" />

            <div
              className={`font-black tracking-tight text-3xl transition-transform ${
                isWarning ? "text-red-500 scale-110 animate-pulse" : "text-white"
              }`}
            >
              {formatTimerSeconds(timeLeft)}
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mt-1">
              {isPaused ? (
                <span className="text-yellow-500 flex items-center gap-1">Pausado</span>
              ) : (
                "Segundos"
              )}
            </span>
          </div>
        </div>

        {/* Next Exercise Preview */}
        <div className="w-full mt-4 mb-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-xl bg-red-600/15 border border-red-600/30 flex items-center justify-center shrink-0 text-red-500">
            <Dumbbell size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block leading-none">
              Próximo Exercício
            </span>
            <p className="text-white font-black uppercase text-xs truncate mt-0.5">
              {nextExerciseName ?? "Final do Treino!"}
            </p>
          </div>
          {nextExerciseName && <Zap size={14} className="text-red-500 shrink-0" />}
        </div>

        {/* Action Controls */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white font-black italic uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isPaused ? (
              <>
                <Play size={16} className="text-green-500 fill-green-500" /> Retomar
              </>
            ) : (
              <>
                <Pause size={16} className="text-yellow-500 fill-yellow-500" /> Pausar
              </>
            )}
          </button>

          <button
            onClick={onSkip}
            className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black italic uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all active:scale-95"
          >
            <SkipForward size={16} /> Pular
          </button>
        </div>
      </div>
    </div>
  )
}
