import { Bell } from "lucide-react"

type AlunoHeaderProps = {
  initials: string
  hasNotification?: boolean
}

export function AlunoHeader({ initials, hasNotification }: AlunoHeaderProps) {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 px-5 h-16 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <div className="flex items-center">
        <span className="font-black italic text-2xl text-white tracking-tighter">
          F<span className="-ml-1">H</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-zinc-400 relative active:text-white transition-colors">
          <Bell size={18} />
          {hasNotification && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-zinc-950" />
          )}
        </button>
        <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 flex items-center justify-center">
          <span className="text-white font-bold text-xs">{initials}</span>
        </div>
      </div>
    </header>
  )
}
