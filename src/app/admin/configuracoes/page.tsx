import { getCurrentUser, getPlans } from "@/app/actions"
import { AdminSettingsForm } from "@/components/admin/admin-settings-form"
import { PlanManager } from "@/components/admin/plan-manager"
import { redirect } from "next/navigation"

export default async function ConfiguracoesPage() {
  const [user, plans] = await Promise.all([
    getCurrentUser(),
    getPlans(),
  ])
  if (!user || user.role !== "admin") redirect("/login")

  return (
    <div className="p-4 md:p-6 pb-24 animate-in fade-in space-y-10">
      <div>
        <h2 className="text-lg font-black italic text-white uppercase tracking-tight mb-6">
          Configuracoes
        </h2>
        <AdminSettingsForm user={user} />
      </div>

      <div className="border-t border-zinc-800 pt-10">
        <PlanManager initialPlans={plans} />
      </div>
    </div>
  )
}
