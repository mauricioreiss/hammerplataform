import { getCurrentUser } from "@/app/actions"
import { AdminSettingsForm } from "@/components/admin/admin-settings-form"
import { redirect } from "next/navigation"

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") redirect("/login")

  return (
    <div className="p-4 md:p-6 pb-24 animate-in fade-in">
      <h2 className="text-lg font-black italic text-white uppercase tracking-tight mb-6">
        Configuracoes
      </h2>
      <AdminSettingsForm user={user} />
    </div>
  )
}
