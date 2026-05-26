"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, BrainCircuit } from "lucide-react"

export function AdminBottomNav() {
  const pathname = usePathname()

  const isHome = pathname === "/admin"
  const isAlunos = pathname.startsWith("/admin/alunos")

  return (
    <nav className="bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 absolute bottom-0 left-0 right-0 z-30 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        <Link
          href="/admin"
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full active:bg-zinc-900 rounded-xl transition-colors"
        >
          <Home
            size={20}
            className={isHome ? "text-red-600" : "text-zinc-500"}
          />
          <span
            className={`text-[8px] uppercase font-bold tracking-wider ${isHome ? "text-red-600" : "text-zinc-500"}`}
          >
            Início
          </span>
        </Link>

        <Link
          href="/admin/alunos"
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full active:bg-zinc-900 rounded-xl transition-colors"
        >
          <Users
            size={20}
            className={isAlunos ? "text-red-600" : "text-zinc-500"}
          />
          <span
            className={`text-[8px] uppercase font-bold tracking-wider ${isAlunos ? "text-red-600" : "text-zinc-500"}`}
          >
            Alunos
          </span>
        </Link>

        <button className="flex-1 flex flex-col items-center justify-center gap-1 h-full active:bg-zinc-900 rounded-xl transition-colors">
          <BrainCircuit size={20} className="text-zinc-500" />
          <span className="text-[8px] uppercase font-bold tracking-wider text-zinc-500">
            IA Maker
          </span>
        </button>
      </div>
    </nav>
  )
}
