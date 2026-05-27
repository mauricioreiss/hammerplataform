"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-red-600 selection:text-white">
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.jpeg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay so the form is readable */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="w-full max-w-[400px] relative z-10">
        <div className="flex items-center justify-center mb-10">
          <span className="font-black italic text-6xl text-white tracking-tighter drop-shadow-lg">
            F<span className="-ml-2 text-zinc-300">H</span>
          </span>
        </div>

        <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl shadow-xl">
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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
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
