"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Dumbbell, BrainCircuit, LogOut } from "lucide-react"
import { logout } from "@/app/auth/actions"

const NAV_ITEMS = [
  { href: "/admin", label: "Inicio", icon: Home, exact: true },
  { href: "/admin/alunos", label: "Alunos", icon: Users },
  { href: "/admin/exercicios", label: "Exercicios", icon: Dumbbell },
  { href: "/admin/ia", label: "IA Maker", icon: BrainCircuit },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-zinc-800 shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center border-b border-zinc-800 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo2.jpeg"
          alt="Felipe Hammer"
          className="h-8 object-contain"
        />
        <span className="font-medium text-[8px] uppercase tracking-[0.2em] text-zinc-400 ml-3 mt-1">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${
                isActive
                  ? "bg-red-600/10 text-red-500 border-l-2 border-red-600"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-zinc-800">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide text-zinc-500 hover:text-red-500 hover:bg-zinc-900 transition-colors w-full"
          >
            <LogOut size={18} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
