import { redirect } from "next/navigation"
import { AlunoHeader } from "@/components/aluno/aluno-header"
import { AlunoDesktopNav } from "@/components/aluno/aluno-desktop-nav"
import { AlunoBottomNav } from "@/components/aluno/aluno-bottom-nav"
import { PaywallGuard } from "@/components/aluno/paywall-guard"
import { FirstLoginGuard } from "@/components/aluno/first-login-guard"
import { getCurrentUser, getUnreadNotificationCount } from "@/app/actions"

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, unreadCount] = await Promise.all([
    getCurrentUser(),
    getUnreadNotificationCount(),
  ])

  if (user?.role === "admin") {
    redirect("/admin")
  }

  const initials = user
    ? user.full_name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?"

  const hasAlert = user?.plan_status === "vencendo" || user?.plan_status === "atrasado"

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-black selection:bg-red-600 selection:text-white">
      <AlunoHeader
        initials={initials}
        avatarUrl={user?.avatar_url ?? null}
        userId={user?.id ?? ""}
        hasNotification={hasAlert}
        unreadCount={unreadCount}
      />
      <AlunoDesktopNav hasPaymentAlert={hasAlert} />
      <main className="flex-1 overflow-y-auto bg-black pb-20 md:pb-0">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8">
          <FirstLoginGuard user={user}>
            <PaywallGuard user={user}>
              {children}
            </PaywallGuard>
          </FirstLoginGuard>
        </div>
      </main>
      <div className="md:hidden">
        <AlunoBottomNav hasPaymentAlert={hasAlert} />
      </div>
    </div>
  )
}
