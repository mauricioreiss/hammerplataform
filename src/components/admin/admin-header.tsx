"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, LogOut, Settings } from "lucide-react"
import { logout } from "@/app/auth/actions"

type AdminHeaderProps = {
  initials: string
  avatarUrl: string | null
  adminName: string
  adminEmail: string
}

export function AdminHeader({ initials, avatarUrl, adminName, adminEmail }: AdminHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
      <header className="bg-zinc-950 border-b border-zinc-800 px-5 md:px-8 h-16 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div className="flex items-center md:hidden">
          <span className="font-black italic text-2xl text-white tracking-tighter">
            F<span className="-ml-1">H</span>
          </span>
        </div>
        <div className="hidden md:block">
          <p className="text-zinc-400 text-xs font-bold">
            Ola, <span className="text-white">{adminName}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-zinc-400 relative active:text-white transition-colors">
            <Bell size={18} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 flex items-center justify-center hover:border-red-600 transition-colors"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xs">{initials}</span>
              )}
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Admin info */}
                <div className="px-4 py-3 border-b border-zinc-800">
                  <p className="text-white text-sm font-bold truncate">{adminName}</p>
                  <p className="text-zinc-500 text-[11px] truncate">{adminEmail}</p>
                </div>

                {/* Config link */}
                <Link
                  href="/admin/configuracoes"
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-3 text-left text-xs font-bold text-zinc-300 hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
                >
                  <Settings size={14} className="text-zinc-500" />
                  Configuracoes
                </Link>

                {/* Separator + logout */}
                <div className="border-t border-zinc-800">
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full px-4 py-3 text-left text-xs font-bold text-red-500 hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut size={14} /> Sair
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overlay to close dropdown */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[9]"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  )
}
