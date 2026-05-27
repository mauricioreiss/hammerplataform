import { AlunoHeader } from "@/components/aluno/aluno-header"
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
      <div className="w-full md:max-w-md mx-auto flex flex-col min-h-screen bg-zinc-950">
        <AlunoHeader
          initials={initials}
          hasNotification={hasAlert}
        />
        <main className="flex-1 overflow-y-auto bg-black relative">
          {children}
        </main>
        <AlunoBottomNav hasPaymentAlert={hasAlert} />
      </div>
    </div>
  )
}
