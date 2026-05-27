import { PaymentManager } from "@/components/aluno/payment-manager"
import { getCurrentUser } from "@/app/actions"
import { redirect } from "next/navigation"

export default async function AssinaturaPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return <PaymentManager user={user} />
}
