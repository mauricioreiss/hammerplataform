import { Bell, LogOut } from "lucide-react"
import { logout } from "@/app/auth/actions"

export function AdminHeader() {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 px-5 md:px-8 h-16 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <div className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo2.jpeg"
          alt="Felipe Hammer"
          className="h-8 object-contain"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="text-zinc-400 relative active:text-white transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-red-600 overflow-hidden border border-zinc-700 flex items-center justify-center">
          <span className="text-white font-bold text-xs">FH</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-zinc-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  )
}
