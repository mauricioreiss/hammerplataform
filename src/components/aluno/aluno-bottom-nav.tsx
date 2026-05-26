"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Dumbbell, Activity, CreditCard } from "lucide-react"

type AlunoBottomNavProps = {
  hasPaymentAlert?: boolean
}

const tabs = [
  {
    href: "/aluno",
    icon: Home,
    label: "Início",
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
    label: "Evolução",
    match: (p: string) => p.startsWith("/aluno/evolucao"),
  },
  {
    href: "/aluno/assinatura",
    icon: CreditCard,
    label: "Assinatura",
    match: (p: string) => p.startsWith("/aluno/assinatura"),
  },
]

export function AlunoBottomNav({ hasPaymentAlert }: AlunoBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 absolute bottom-0 left-0 right-0 z-30 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname)
          const Icon = tab.icon
          const showDot = tab.label === "Assinatura" && hasPaymentAlert

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full active:bg-zinc-900 rounded-xl transition-colors relative"
            >
              <Icon
                size={20}
                className={isActive ? "text-red-600" : "text-zinc-500"}
              />
              <span
                className={`text-[8px] uppercase font-bold tracking-wider ${isActive ? "text-red-600" : "text-zinc-500"}`}
              >
                {tab.label}
              </span>
              {showDot && (
                <span className="absolute top-2 right-[25%] w-2 h-2 bg-red-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
