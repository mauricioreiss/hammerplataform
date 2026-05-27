"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Dumbbell, Activity, CreditCard } from "lucide-react"

type AlunoDesktopNavProps = {
  hasPaymentAlert?: boolean
}

const tabs = [
  {
    href: "/aluno",
    icon: Home,
    label: "Inicio",
    match: (p: string) => p === "/aluno",
  },
  {
    href: "/aluno/treino",
    icon: Dumbbell,
    label: "Treino",
    match: (p: string) => p.startsWith("/aluno/treino"),
  },
  {
    href: "/aluno/evolucao",
    icon: Activity,
    label: "Evolucao",
    match: (p: string) => p.startsWith("/aluno/evolucao"),
  },
  {
    href: "/aluno/assinatura",
    icon: CreditCard,
    label: "Assinatura",
    match: (p: string) => p.startsWith("/aluno/assinatura"),
  },
]

export function AlunoDesktopNav({ hasPaymentAlert }: AlunoDesktopNavProps) {
  const pathname = usePathname()

  return (
    <nav className="hidden md:block bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-8 flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname)
          const Icon = tab.icon
          const showDot = tab.label === "Assinatura" && hasPaymentAlert

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors relative ${
                isActive
                  ? "border-red-600 text-red-500"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {showDot && (
                <span className="w-2 h-2 bg-red-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
