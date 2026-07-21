"use client"

import { useState, useEffect, useRef } from "react"
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
  // Stable ref so the interval effect never depends on the callback identity.
  // closeRestTimer in the parent is a plain function recreated on every render;
  // putting it in the dep array would restart the interval every tick.
  const onCompleteRef = useRef(onComplete)
  const completedRef = useRef(false)

  // Keep the ref current without touching the interval.
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Countdown — only restarts when isPaused changes, not on every parent render.
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          // Defer outside setState batch to avoid React 18 batching surprises.
          setTimeout(() => {
            if (!completedRef.current) {
              completedRef.current = true
              onCompleteRef.current()
            }
          }, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPaused]) // ← no callback in deps, intentional

  // SVG dimensions
  const size = 240
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  // Remaining ratio: 1.0 at start → 0.0 at end.
  const remainingRatio = totalSeconds > 0 ? timeLeft / totalSeconds : 0
  // Ring drains: full at start, empty at end.
  const strokeDashoffset = circumference * (1 - remainingRatio)

  // Hand angle: elapsed ratio drives 0→360 clockwise.
  const elapsedRatio = 1 - remainingRatio
  // SVG zero-angle is 3 o'clock; subtract 90deg so 0 elapsed = 12 o'clock.
  const handDeg = elapsedRatio * 360 - 90
  const handRad = (handDeg * Math.PI) / 180
  const handLength = radius - strokeWidth - 4
  const handX2 = cx + handLength * Math.cos(handRad)
  const handY2 = cy + handLength * Math.sin(handRad)

  const isWarning = timeLeft <= 5 && timeLeft > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden flex flex-col items-center">
        {/* Ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-black italic uppercase tracking-wider mb-5">
          <Timer size={14} />
          Tempo de Descanso
        </div>

        {/* Analog Clock / Circular Timer */}
        <div className="relative my-2">
          <svg
            width={size}
            height={size}
            className="drop-shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            {/* Background track */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              className="stroke-zinc-900"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Draining arc — variable dasharray so it shrinks clockwise from 12 */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              className={`transition-all duration-1000 ease-linear ${
                isWarning ? "stroke-red-500" : "stroke-red-600"
              }`}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * remainingRatio} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              fill="transparent"
              transform={`rotate(-90 ${cx} ${cy})`}
            />

            {/* Tick marks: 60 ticks total, every 5th is major */}
            {Array.from({ length: 60 }).map((_, i) => {
              const isMajor = i % 5 === 0
              const tickDeg = i * 6 - 90
              const tickRad = (tickDeg * Math.PI) / 180
              const outer = radius - strokeWidth / 2 - 2
              const inner = outer - (isMajor ? 10 : 5)
              return (
                <line
                  key={i}
                  x1={cx + outer * Math.cos(tickRad)}
                  y1={cy + outer * Math.sin(tickRad)}
                  x2={cx + inner * Math.cos(tickRad)}
                  y2={cy + inner * Math.sin(tickRad)}
                  className={isMajor ? "stroke-zinc-400" : "stroke-zinc-700"}
                  strokeWidth={isMajor ? 2 : 1}
                  strokeLinecap="round"
                />
              )
            })}

            {/* Analog second hand — SVG line for pixel-perfect pivot and rotation */}
            <line
              x1={cx}
              y1={cy}
              x2={handX2}
              y2={handY2}
              stroke="url(#handGrad)"
              strokeWidth={3}
              strokeLinecap="round"
              style={{ transition: "x2 1s linear, y2 1s linear" }}
            />

            {/* Center pivot knob */}
            <circle
              cx={cx}
              cy={cy}
              r={6}
              className="fill-zinc-950 stroke-red-500"
              strokeWidth={2}
            />

            <defs>
              <linearGradient id="handGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>

          {/* Digital countdown — centered over the SVG */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div
              className={`font-black tracking-tight text-3xl ${
                isWarning ? "text-red-500 animate-pulse" : "text-white"
              }`}
            >
              {formatTimerSeconds(timeLeft)}
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mt-1">
              {isPaused ? (
                <span className="text-yellow-500">Pausado</span>
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

        {/* Controls */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? "Retomar descanso" : "Pausar descanso"}
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white font-black italic uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isPaused ? (
              <><Play size={16} className="text-green-500 fill-green-500" /> Retomar</>
            ) : (
              <><Pause size={16} className="text-yellow-500 fill-yellow-500" /> Pausar</>
            )}
          </button>

          <button
            onClick={onSkip}
            aria-label="Pular descanso"
            className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black italic uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all active:scale-95"
          >
            <SkipForward size={16} /> Pular
          </button>
        </div>
      </div>
    </div>
  )
}
