"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, Loader2 } from "lucide-react"
import { getNotifications, markNotificationsRead } from "@/app/actions"
import type { Notification } from "@/lib/types"

type NotificationPanelProps = {
  unreadCount: number
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "agora"
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export function NotificationPanel({ unreadCount }: NotificationPanelProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [marking, setMarking] = useState(false)

  async function handleOpen() {
    if (open) {
      setOpen(false)
      return
    }
    setOpen(true)
    setLoading(true)
    const data = await getNotifications()
    setNotifications(data)
    setLoading(false)
  }

  async function handleMarkRead() {
    setMarking(true)
    await markNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarking(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="text-zinc-400 relative active:text-white transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-zinc-950 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <p className="text-white text-xs font-bold uppercase">Notificacoes</p>
              {notifications.some((n) => !n.is_read) && (
                <button
                  onClick={handleMarkRead}
                  disabled={marking}
                  className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 hover:text-red-400 disabled:opacity-50"
                >
                  {marking ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                  Marcar lidas
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={18} className="animate-spin text-zinc-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell size={24} className="mx-auto text-zinc-700 mb-2" />
                  <p className="text-zinc-500 text-xs">Nenhuma notificacao</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-zinc-800 last:border-0 ${
                      n.is_read ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                      )}
                      <div className={`min-w-0 ${n.is_read ? "pl-5" : ""}`}>
                        <p className="text-white text-xs font-bold">{n.title}</p>
                        <p className="text-zinc-400 text-[11px] mt-0.5">{n.message}</p>
                        <p className="text-zinc-600 text-[10px] mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
