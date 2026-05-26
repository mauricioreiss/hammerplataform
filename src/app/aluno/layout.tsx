import { AlunoHeader } from "@/components/aluno/aluno-header"
import { AlunoBottomNav } from "@/components/aluno/aluno-bottom-nav"
import { currentUser } from "@/lib/mock-data"

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black selection:bg-red-600 selection:text-white">
      <div className="max-w-4xl mx-auto flex flex-col min-h-screen bg-zinc-950">
        <AlunoHeader
          initials={currentUser.initials}
          hasNotification={currentUser.status === "vencendo"}
        />
        <main className="flex-1 overflow-y-auto bg-black relative">
          {children}
        </main>
        <AlunoBottomNav hasPaymentAlert={currentUser.status === "vencendo"} />
      </div>
    </div>
  )
}
