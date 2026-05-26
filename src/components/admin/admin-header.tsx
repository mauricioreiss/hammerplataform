import { Bell, LogOut } from "lucide-react"
import { logout } from "@/app/auth/actions"

export function AdminHeader() {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 px-5 h-16 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <div className="flex flex-col justify-center">
        <div className="flex items-center">
          <span className="font-black italic text-2xl text-white tracking-tighter">
            F<span className="-ml-1">H</span>
          </span>
        </div>
        <span className="font-medium text-[8px] uppercase tracking-[0.2em] text-zinc-400 mt-0.5">
          Admin
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-zinc-400 relative active:text-white transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felipe"
            alt="Avatar"
          />
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
