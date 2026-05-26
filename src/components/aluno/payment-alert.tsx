import Link from "next/link"
import { AlertTriangle } from "lucide-react"

type PaymentAlertProps = {
  daysLeft: number
}

export function PaymentAlert({ daysLeft }: PaymentAlertProps) {
  return (
    <Link
      href="/aluno/assinatura"
      className="bg-red-950/40 border border-red-900 p-4 rounded-xl flex items-center justify-between active:scale-95 transition-transform block"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">
            Seu plano vence em {daysLeft} dias
          </p>
          <p className="text-red-400 text-xs">
            Toque aqui para renovar via PIX.
          </p>
        </div>
      </div>
    </Link>
  )
}
