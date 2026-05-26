import { AdminHeader } from "@/components/admin/admin-header"
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-0 sm:p-4 selection:bg-red-600 selection:text-white">
      <div className="w-full h-dvh sm:h-[850px] max-w-[400px] bg-zinc-950 sm:rounded-[2rem] sm:border-8 border-zinc-900 relative overflow-hidden flex flex-col shadow-2xl">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-black relative">
          {children}
        </main>
        <AdminBottomNav />
      </div>
    </div>
  )
}
