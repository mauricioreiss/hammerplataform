"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, Loader2 } from "lucide-react"
import { createAluno } from "@/app/actions"
import type { Plan } from "@/lib/types"

type AddStudentFormProps = {
  plans: Plan[]
}

export function AddStudentForm({ plans }: AddStudentFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    objective: "",
    planId: "",
    paymentReceived: false,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await createAluno(form)

    if (!result.success) {
      setError(result.error ?? "Erro ao criar aluno.")
      setLoading(false)
      return
    }

    setForm({ name: "", email: "", password: "", objective: "", planId: "", paymentReceived: false })
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
        <Plus size={14} /> Novo
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black italic text-white uppercase tracking-tight">
            Novo Aluno
          </h3>
          <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Nome Completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
          />
          <input
            type="password"
            placeholder="Senha inicial"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
          />
          <select
            value={form.objective}
            onChange={(e) => setForm({ ...form, objective: e.target.value })}
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-400 focus:outline-none focus:border-red-600"
          >
            <option value="">Objetivo</option>
            <option value="Hipertrofia">Hipertrofia</option>
            <option value="Emagrecimento">Emagrecimento</option>
            <option value="Forca">Forca</option>
          </select>

          {/* Plan selection */}
          <select
            value={form.planId}
            onChange={(e) => setForm({ ...form, planId: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-400 focus:outline-none focus:border-red-600"
          >
            <option value="">Plano (opcional)</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / {plan.cycle}
              </option>
            ))}
          </select>

          {/* Payment toggle */}
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-3">
            <span className="text-sm text-zinc-400">Pagamento Inicial Recebido?</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, paymentReceived: !form.paymentReceived })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.paymentReceived ? "bg-green-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  form.paymentReceived ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {loading ? "Criando..." : "Criar Aluno"}
          </button>
        </form>
      </div>
    </div>
  )
}
