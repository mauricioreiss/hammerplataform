import { AdminHeader } from "@/components/admin/admin-header"
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black flex selection:bg-red-600 selection:text-white">
      {/* Desktop sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-black relative">
          {children}
        </main>
        {/* Bottom nav only on mobile */}
        <AdminBottomNav />
      </div>
    </div>
  )
}
