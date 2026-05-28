"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { login } from "@/app/auth/actions"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(result.role === "admin" ? "/admin" : "/aluno")
  }

  return (
    <div className="min-h-[100dvh] relative w-full flex flex-col items-center justify-end pb-[10vh] px-4 bg-[#2a2a2a] selection:bg-red-600 selection:text-white">
      {/* Background image */}
      <Image
        src="/Logo3.png"
        alt=""
        fill
        priority
        className="-z-10 object-cover object-top"
      />
      {/* Gradient overlay - lighter at top to show logo, darker at bottom for form */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />

      {/* Login card in the lower half of the image */}
      <div className="w-full max-w-[400px] relative z-10">
        <div className="bg-zinc-950/70 backdrop-blur-md border border-zinc-800/50 p-6 rounded-2xl shadow-2xl">
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tight mb-6">
            Entrar
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-950/80 border border-zinc-800/50 rounded-xl p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-950/80 border border-zinc-800/50 rounded-xl p-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition-colors"
            />

            {error && (
              <p className="text-red-500 text-sm font-bold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black italic uppercase py-4 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
