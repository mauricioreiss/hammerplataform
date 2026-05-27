"use client"

import { useState } from "react"
import { CreditCard, QrCode, Copy, ShieldAlert, Clock, AlertTriangle } from "lucide-react"
import type { UserProfile } from "@/lib/types"

type PaymentManagerProps = {
  user: UserProfile
  pixKey: string
}

export function PaymentManager({ user, pixKey }: PaymentManagerProps) {
  const [step, setStep] = useState<"status" | "pix">("status")
  const [copied, setCopied] = useState(false)

  const isBlocked = user.plan_status === "blocked"
  const isPending = user.plan_status === "pending"
  const isExpired = user.expire_date && new Date(user.expire_date) < new Date()
  const isPaywalled = isBlocked || isPending || isExpired

  const statusLabel =
    isBlocked ? "Bloqueado" :
    isPending ? "Pendente" :
    isExpired ? "Expirado" :
    user.plan_status === "atrasado" ? "Atrasado" :
    user.plan_status === "vencendo" ? "Vencendo" : "Ativo"

  const statusColor =
    isBlocked || isExpired || user.plan_status === "atrasado"
      ? "bg-red-500/20 text-red-500 border-red-500/30"
      : isPending || user.plan_status === "vencendo"
        ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
        : "bg-green-500/20 text-green-500 border-green-500/30"

  const expireLabel = user.expire_date
    ? new Date(user.expire_date).toLocaleDateString("pt-BR")
    : "—"

  const pageTitle =
    isBlocked ? "Acesso Bloqueado" :
    isPending ? "Pagamento Pendente" :
    isExpired ? "Plano Expirado" : "Sua Assinatura"

  const PageIcon =
    isBlocked ? ShieldAlert :
    isPending ? Clock :
    isExpired ? AlertTriangle : CreditCard

  function handleCopy() {
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (step === "pix") {
    return (
      <div className="py-6 space-y-6 pb-24 md:pb-6 animate-in fade-in duration-300">
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center">
            <h3 className="text-white font-bold uppercase mb-2">
              Pagamento via PIX
            </h3>
            <p className="text-zinc-400 text-xs mb-6">
              Copie a chave abaixo e faca a transferencia para liberar seu acesso.
            </p>

            <div className="bg-white p-4 inline-block rounded-xl mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <QrCode size={180} className="text-black" />
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex justify-between items-center mb-4">
              <span className="text-zinc-500 text-xs font-mono truncate mr-2">
                {pixKey}
              </span>
              <button
                onClick={handleCopy}
                className="text-red-500 font-bold text-[10px] uppercase flex items-center gap-1 shrink-0"
              >
                <Copy size={12} /> {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 mb-4">
              <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Valor</p>
              <p className="text-white text-lg font-black">
                R$ {(user.plan_value ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <p className="text-[10px] text-zinc-500 font-bold uppercase">
              Apos o pagamento, o professor ira liberar seu acesso.
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
    <div className="py-6 space-y-6 pb-24 md:pb-6 animate-in fade-in duration-300">
      <div className="text-center mb-8 pt-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border ${
          isPaywalled
            ? "bg-red-500/10 border-red-500/30"
            : "bg-zinc-900 border-zinc-800"
        }`}>
          <PageIcon size={24} className={isPaywalled ? "text-red-500" : "text-zinc-400"} />
        </div>
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
          {pageTitle}
        </h2>
        {isPaywalled && (
          <p className="text-zinc-400 text-xs mt-2">
            {isBlocked
              ? "Seu acesso foi bloqueado pelo treinador. Entre em contato."
              : "Realize o pagamento para liberar seu acesso ao app."}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
            <div>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                Plano Atual
              </p>
              <p className="text-white font-bold">{user.plan_name ?? "—"}</p>
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
              <strong className={isPaywalled ? "text-red-500" : "text-white"}>
                {expireLabel}
              </strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setStep("pix")}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          {isPaywalled ? "Pagar Agora" : "Pagar / Renovar Plano"}
        </button>
      </div>
    </div>
  )
}
