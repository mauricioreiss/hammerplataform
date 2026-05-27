"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Database, Loader2 } from "lucide-react"
import { seedDefaultExercises } from "@/app/actions"

export function SeedExercisesButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSeed() {
    setLoading(true)
    setError("")

    const result = await seedDefaultExercises()

    if (!result.success) {
      setError(result.error ?? "Erro ao popular exercícios.")
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase px-4 py-2 rounded-lg flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
        {loading ? "Populando..." : "Popular Banco Padrão"}
      </button>
      {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
    </div>
  )
}
