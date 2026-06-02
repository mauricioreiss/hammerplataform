"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2, ClipboardList } from "lucide-react"
import { upsertAnamnesis } from "@/app/actions"
import type { Anamnesis } from "@/lib/types"

const PAR_Q_QUESTIONS = [
  "Algum médico já disse que você possui problema cardíaco?",
  "Você sente dor no peito durante atividades físicas?",
  "Possui algum problema ósseo, articular ou muscular que possa piorar com exercício?",
  "Faz uso contínuo de medicamentos para pressão arterial ou coração?",
  "Possui diabetes, hipertensão ou colesterol elevado?",
]

type AnamneseModalProps = {
  studentId: string
  anamnesis: Anamnesis | null
  onClose: () => void
}

export function AnamneseModal({ studentId, anamnesis, onClose }: AnamneseModalProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [birthDate, setBirthDate] = useState(anamnesis?.birth_date ?? "")
  const [weight, setWeight] = useState(anamnesis?.weight?.toString() ?? "")
  const [height, setHeight] = useState(anamnesis?.height?.toString() ?? "")
  const [injuries, setInjuries] = useState(anamnesis?.injuries ?? "")
  const [daysPerWeek, setDaysPerWeek] = useState(anamnesis?.days_per_week?.toString() ?? "")
  const [parq, setParq] = useState<Record<number, boolean>>(() => {
    if (!anamnesis?.par_q_data) return {}
    const initial: Record<number, boolean> = {}
    for (const [key, val] of Object.entries(anamnesis.par_q_data)) {
      const idx = parseInt(key.replace("q", ""), 10)
      if (!isNaN(idx)) initial[idx] = val
    }
    return initial
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const parqData: Record<string, boolean> = {}
    for (const [key, val] of Object.entries(parq)) {
      parqData[`q${key}`] = val
    }

    const payload = {
      birth_date: birthDate || undefined,
      weight: weight ? Number(weight) : undefined,
      height: height ? Number(height) : undefined,
      injuries: injuries.trim() || undefined,
      days_per_week: daysPerWeek ? Number(daysPerWeek) : undefined,
      par_q_data: Object.keys(parqData).length > 0 ? parqData : undefined,
    }

    const result = await upsertAnamnesis(studentId, payload)

    if (!result.success) {
      setError(result.error ?? "Erro ao salvar anamnese.")
      setSaving(false)
      return
    }

    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-zinc-400" />
            <h3 className="text-white font-bold uppercase text-sm">
              {anamnesis ? "Editar Anamnese" : "Preencher Anamnese"}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">
                Peso (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="80"
                min="1"
                max="500"
                step="0.1"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">
                Altura (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                min="1"
                max="300"
                step="1"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">
              Dias por Semana
            </label>
            <select
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-400 focus:outline-none focus:border-red-600"
            >
              <option value="">Selecione</option>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>{d}x por semana</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">
              Lesões / Dores
            </label>
            <textarea
              value={injuries}
              onChange={(e) => setInjuries(e.target.value)}
              placeholder="Descreva lesões, dores ou limitações..."
              rows={3}
              maxLength={2000}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 resize-none"
            />
          </div>

          <div>
            <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-2">
              PAR-Q (Questionário de Prontidão)
            </label>
            <div className="space-y-2">
              {PAR_Q_QUESTIONS.map((q, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 cursor-pointer hover:border-zinc-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={parq[i] ?? false}
                    onChange={(e) => setParq({ ...parq, [i]: e.target.checked })}
                    className="mt-0.5 accent-red-600 shrink-0"
                  />
                  <span className="text-zinc-300 text-xs leading-relaxed">{q}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-xs font-bold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 text-sm"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Salvando..." : "Salvar Anamnese"}
          </button>
        </form>
      </div>
    </div>
  )
}
