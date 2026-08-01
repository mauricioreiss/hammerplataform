"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react"
import { createPlan, updatePlan, deletePlan } from "@/app/actions"
import type { Plan } from "@/lib/types"

type PlanManagerProps = {
  initialPlans: Plan[]
}

const CYCLE_LABELS: Record<string, string> = {
  mensal: "Mensal",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
  custom: "Personalizado",
}

const PRESET_DAYS: Record<string, string> = {
  mensal: "30",
  bimestral: "60",
  trimestral: "90",
  semestral: "180",
  anual: "365",
}

export function PlanManager({ initialPlans }: PlanManagerProps) {
  const router = useRouter()
  const [plans, setPlans] = useState(initialPlans)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [cycle, setCycle] = useState("mensal")
  const [durationDays, setDurationDays] = useState("30")

  function resetForm() {
    setName("")
    setPrice("")
    setCycle("mensal")
    setDurationDays("30")
    setEditingId(null)
    setShowForm(false)
    setError("")
  }

  function startEdit(plan: Plan) {
    setName(plan.name)
    setPrice(String(plan.price))
    const knownCycle = PRESET_DAYS[plan.cycle] ? plan.cycle : "custom"
    setCycle(knownCycle)
    setDurationDays(String(plan.duration_days ?? PRESET_DAYS[plan.cycle] ?? 30))
    setEditingId(plan.id)
    setShowForm(true)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !price) return

    setLoading(true)
    setError("")

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Valor inválido.")
      setLoading(false)
      return
    }

    const durationNum = parseInt(durationDays, 10)
    if (isNaN(durationNum) || durationNum <= 0) {
      setError("Duração em dias inválida.")
      setLoading(false)
      return
    }

    const payload = {
      name: name.trim(),
      price: priceNum,
      cycle,
      duration_days: durationNum,
    }

    const result = editingId
      ? await updatePlan(editingId, payload)
      : await createPlan(payload)

    if (!result.success) {
      setError(result.error ?? "Erro ao salvar plano.")
      setLoading(false)
      return
    }

    if (editingId) {
      setPlans(
        plans.map((p) =>
          p.id === editingId
            ? { ...p, name: payload.name, price: payload.price, cycle: payload.cycle, duration_days: payload.duration_days }
            : p
        )
      )
    } else if (result.plan) {
      setPlans((prev) => [...prev, result.plan!])
    }
    router.refresh()

    resetForm()
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setLoading(true)
    const result = await deletePlan(id)
    if (result.success) {
      setPlans(plans.filter((p) => p.id !== id))
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black italic text-white uppercase tracking-tight">
          Gerenciar Planos
        </h3>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="bg-red-600 text-white text-xs font-bold uppercase px-3 py-2 rounded-lg flex items-center gap-1 active:scale-95 transition-transform"
          >
            <Plus size={14} /> Novo
          </button>
        )}
      </div>

      {/* Plan list */}
      {plans.length === 0 && !showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <p className="text-zinc-500 text-sm">Nenhum plano cadastrado.</p>
          <p className="text-zinc-600 text-xs mt-1">Crie seu primeiro plano acima.</p>
        </div>
      )}

      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between"
        >
          <div>
            <p className="text-white font-bold text-sm">{plan.name}</p>
            <p className="text-zinc-500 text-xs">
              R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / {CYCLE_LABELS[plan.cycle] ?? plan.cycle} ({plan.duration_days ?? PRESET_DAYS[plan.cycle] ?? 30} dias)
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => startEdit(plan)}
              className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => handleDelete(plan.id)}
              disabled={loading}
              className="text-zinc-500 hover:text-red-500 p-2 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* Create/Edit form */}
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-bold text-sm uppercase">
              {editingId ? "Editar Plano" : "Novo Plano"}
            </p>
            <button onClick={resetForm} className="text-zinc-500 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Nome do Plano
              </label>
              <input
                type="text"
                placeholder="Ex: Mensal VIP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                placeholder="Ex: 150"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="1"
                step="0.01"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Ciclo / Frequência
              </label>
              <select
                value={cycle}
                onChange={(e) => {
                  const selected = e.target.value
                  setCycle(selected)
                  if (PRESET_DAYS[selected]) {
                    setDurationDays(PRESET_DAYS[selected])
                  }
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-400 focus:outline-none focus:border-red-600"
              >
                <option value="mensal">Mensal (30 dias)</option>
                <option value="bimestral">Bimestral (60 dias)</option>
                <option value="trimestral">Trimestral (90 dias)</option>
                <option value="semestral">Semestral (180 dias)</option>
                <option value="anual">Anual (365 dias)</option>
                <option value="custom">Personalizado (Dias livres)</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block mb-1">
                Duração em Dias
              </label>
              <input
                type="number"
                placeholder="Ex: 30"
                value={durationDays}
                onChange={(e) => {
                  setDurationDays(e.target.value)
                  const matchingPreset = Object.entries(PRESET_DAYS).find(([, d]) => d === e.target.value)
                  if (matchingPreset) {
                    setCycle(matchingPreset[0])
                  } else {
                    setCycle("custom")
                  }
                }}
                required
                min="1"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>

            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 text-sm"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {editingId ? "Salvar" : "Criar Plano"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}


