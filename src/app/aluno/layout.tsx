import { AlunoHeader } from "@/components/aluno/aluno-header"
import { AlunoBottomNav } from "@/components/aluno/aluno-bottom-nav"
import { currentUser } from "@/lib/mock-data"

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-0 sm:p-4 selection:bg-red-600 selection:text-white">
      <div className="w-full h-dvh sm:h-[850px] max-w-[400px] bg-zinc-950 sm:rounded-[2rem] sm:border-8 border-zinc-900 relative overflow-hidden flex flex-col shadow-2xl">
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
