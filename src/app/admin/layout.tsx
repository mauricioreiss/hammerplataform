import { AdminHeader } from "@/components/admin/admin-header"
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { getCurrentUser, getAuthEmail } from "@/app/actions"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, email] = await Promise.all([
    getCurrentUser(),
    getAuthEmail(),
  ])

  const initials = user
    ? user.full_name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD"

  return (
    <div className="min-h-screen bg-black flex selection:bg-red-600 selection:text-white">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader
          initials={initials}
          avatarUrl={user?.avatar_url ?? null}
          adminName={user?.full_name ?? "Admin"}
          adminEmail={email}
        />
        <main className="flex-1 overflow-y-auto bg-black relative">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <AdminBottomNav />
      </div>
    </div>
  )
}
