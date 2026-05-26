"use client"

import { CheckCircle2, Lock, QrCode, Copy } from "lucide-react"

const BLURRED_WORKOUTS = [
  { name: "Treino A - Inferiores", count: 5 },
  { name: "Treino B - Superiores", count: 6 },
  { name: "Treino C - Full Body", count: 4 },
]

const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY ?? ""

export function Paywall() {
  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:px-8 pt-10 pb-24 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-lg mx-auto">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 text-green-500 rounded-full mb-4 border border-green-500/20">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">
            Análise Concluída
          </h2>
          <p className="text-zinc-400 text-sm mt-2">
            Sua anamnese foi processada. O professor já foi notificado.
          </p>
        </div>

        {/* Blurred workout preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-8 shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
            <h3 className="font-bold text-white uppercase text-sm">
              Seu Plano Estruturado
            </h3>
            <span className="text-[10px] bg-red-600/20 text-red-500 px-2 py-1 rounded font-bold uppercase">
              Trancado
            </span>
          </div>

          <div className="p-4 relative">
            <div className="space-y-3 blur-md opacity-60 pointer-events-none select-none">
              {BLURRED_WORKOUTS.map((w) => (
                <div
                  key={w.name}
                  className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex justify-between"
                >
                  <span className="text-white font-bold uppercase">
                    {w.name}
                  </span>
                  <span className="text-red-500 font-bold">
                    {w.count} Exercícios
                  </span>
                </div>
              ))}
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center border-2 border-red-600 mb-3 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                <Lock size={24} className="text-red-500" />
              </div>
              <p className="text-white font-black uppercase text-lg">
                Conteúdo Exclusivo
              </p>
              <p className="text-zinc-400 text-xs text-center max-w-[200px] mt-1">
                Efetue o pagamento para o professor revisar e liberar seu acesso
                ao App.
              </p>
            </div>
          </div>
        </div>

        {/* PIX payment */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center shadow-lg">
          <h3 className="text-xl font-black text-white uppercase italic mb-1">
            Acesso Premium
          </h3>
          <p className="text-3xl font-black text-red-600 mb-6">
            R$ 150,00{" "}
            <span className="text-sm text-zinc-500 font-normal">/mês</span>
          </p>

          <div className="bg-white p-4 inline-block rounded-xl mb-6">
            <QrCode size={160} className="text-black" />
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex justify-between items-center mb-6">
            <span className="text-zinc-500 text-xs font-mono truncate mr-2">
              {PIX_KEY}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(PIX_KEY)}
              className="text-red-500 font-bold text-[10px] uppercase flex items-center gap-1 shrink-0"
            >
              <Copy size={12} /> Copiar
            </button>
          </div>

          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <CheckCircle2 size={20} /> Já fiz o pagamento
          </button>
        </div>
      </div>
    </div>
  )
}
