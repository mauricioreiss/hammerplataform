import { AlunoHeader } from "@/components/aluno/aluno-header"
import { AlunoDesktopNav } from "@/components/aluno/aluno-desktop-nav"
import { AlunoBottomNav } from "@/components/aluno/aluno-bottom-nav"
import { getCurrentUser } from "@/app/actions"

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

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
    <div className="min-h-screen bg-black selection:bg-red-600 selection:text-white">
      <div className="w-full flex flex-col min-h-screen bg-zinc-950">
        <AlunoHeader
          initials={initials}
          hasNotification={hasAlert}
        />
        <AlunoDesktopNav hasPaymentAlert={hasAlert} />
        <main className="flex-1 overflow-y-auto bg-black relative">
          <div className="w-full max-w-5xl mx-auto px-4 md:px-8">
            {children}
          </div>
        </main>
        <div className="md:hidden">
          <AlunoBottomNav hasPaymentAlert={hasAlert} />
        </div>
      </div>
    </div>
  )
}
