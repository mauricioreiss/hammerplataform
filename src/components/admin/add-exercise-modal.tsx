"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, Loader2 } from "lucide-react"
import { createExercise, getMuscleGroups } from "@/app/actions"

export function AddExerciseModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [muscleGroups, setMuscleGroups] = useState<string[]>([])
  const [isCustomGroup, setIsCustomGroup] = useState(false)
  const [customGroup, setCustomGroup] = useState("")
  const [form, setForm] = useState({ name: "", muscleGroup: "", illustrationUrl: "" })

  useEffect(() => {
    if (open) {
      getMuscleGroups().then(setMuscleGroups)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const finalMuscleGroup = isCustomGroup ? customGroup.trim() : form.muscleGroup.trim()

    if (!finalMuscleGroup) {
      setError("Informe o grupo muscular.")
      setLoading(false)
      return
    }

    const result = await createExercise({
      name: form.name,
      muscleGroup: finalMuscleGroup,
      illustrationUrl: form.illustrationUrl || undefined,
    })

    if (!result.success) {
      setError(result.error ?? "Erro ao criar exercício.")
      setLoading(false)
      return
    }

    setForm({ name: "", muscleGroup: "", illustrationUrl: "" })
    setCustomGroup("")
    setIsCustomGroup(false)
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-red-600 text-white text-xs font-bold uppercase px-3 py-2 rounded-lg flex items-center gap-1 active:scale-95 transition-transform"
      >
        <Plus size={14} /> Adicionar Exercício
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black italic text-white uppercase tracking-tight">
            Novo Exercício
          </h3>
          <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Nome do Exercício"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
          />

          <select
            value={isCustomGroup ? "__new__" : form.muscleGroup}
            onChange={(e) => {
              if (e.target.value === "__new__") {
                setIsCustomGroup(true)
                setForm({ ...form, muscleGroup: "" })
              } else {
                setIsCustomGroup(false)
                setForm({ ...form, muscleGroup: e.target.value })
              }
            }}
            required={!isCustomGroup}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-400 focus:outline-none focus:border-red-600"
          >
            <option value="">Grupo Muscular</option>
            {muscleGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
            <option value="__new__">+ Novo Grupo Muscular...</option>
          </select>

          {isCustomGroup && (
            <input
              type="text"
              placeholder="Digite o novo grupo muscular"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
              required
              autoFocus
              className="w-full bg-zinc-950 border border-red-600/50 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
            />
          )}

          <input
            type="url"
            placeholder="URL da Imagem (opcional)"
            value={form.illustrationUrl}
            onChange={(e) => setForm({ ...form, illustrationUrl: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
          />

          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {loading ? "Criando..." : "Criar Exercício"}
          </button>
        </form>
      </div>
    </div>
  )
}

