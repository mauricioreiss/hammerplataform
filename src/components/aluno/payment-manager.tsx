"use client"

import { useState } from "react"
import { CreditCard, QrCode, Copy } from "lucide-react"
import type { UserProfile } from "@/lib/types"

type PaymentManagerProps = {
  user: UserProfile
}

const pixKey = process.env.NEXT_PUBLIC_PIX_KEY ?? ""

export function PaymentManager({ user }: PaymentManagerProps) {
  const [step, setStep] = useState<"status" | "pix">("status")

  const isAlert = user.plan_status === "vencendo" || user.plan_status === "atrasado"
  const statusLabel = user.plan_status === "atrasado" ? "Atrasado" : user.plan_status === "vencendo" ? "Vencendo" : "Ativo"
  const statusColor = user.plan_status === "atrasado"
    ? "bg-red-500/20 text-red-500 border-red-500/30"
    : user.plan_status === "vencendo"
      ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      : "bg-green-500/20 text-green-500 border-green-500/30"

  const expireLabel = user.expire_date
    ? new Date(user.expire_date).toLocaleDateString("pt-BR")
    : "—"

  if (step === "pix") {
    return (
      <div className="p-4 md:p-6 space-y-6 pb-24 animate-in fade-in duration-300">
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center">
            <h3 className="text-white font-bold uppercase mb-2">
              Pagamento via PIX
            </h3>
            <p className="text-zinc-400 text-xs mb-6">
              Escaneie o QR Code abaixo ou copie a chave para renovar seu
              acesso.
            </p>

            <div className="bg-white p-4 inline-block rounded-xl mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <QrCode size={180} className="text-black" />
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex justify-between items-center mb-4">
              <span className="text-zinc-500 text-xs font-mono">
                {pixKey}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(pixKey)}
                className="text-red-500 font-bold text-[10px] uppercase flex items-center gap-1"
              >
                <Copy size={12} /> Copiar
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 font-bold uppercase">
              Após o pagamento, o professor será notificado e seu plano
              renovado.
            </p>
          </div>

          <button
            onClick={() => setStep("status")}
            className="w-full bg-zinc-900 text-zinc-400 font-bold uppercase py-4 rounded-xl text-xs active:bg-zinc-800 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 pb-24 animate-in fade-in duration-300">
      <div className="text-center mb-8 pt-2">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-800">
          <CreditCard size={24} className="text-zinc-400" />
        </div>
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
          Sua Assinatura
        </h2>
      </div>

      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
            <div>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                Plano Atual
              </p>
              <p className="text-white font-bold">{user.plan_name ?? "Mensal"}</p>
            </div>
            <span className={`${statusColor} border px-2 py-1 rounded text-[10px] font-black uppercase`}>
              {statusLabel}
            </span>
          </div>

          <div className="space-y-1 text-center">
            <p className="text-zinc-500 text-[10px] uppercase font-bold">
              Valor
            </p>
            <p className="text-3xl font-black text-white">
              R$ {(user.plan_value ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-zinc-400 text-xs mt-2">
              Vencimento:{" "}
              <strong
                className={isAlert ? "text-yellow-500" : "text-white"}
              >
                {expireLabel}
              </strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setStep("pix")}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          Pagar / Renovar Plano
        </button>
      </div>
    </div>
  )
}
