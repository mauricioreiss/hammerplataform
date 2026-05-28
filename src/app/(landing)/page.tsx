import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions"
import { SalesFunnel } from "@/components/landing/sales-funnel"

export default async function LandingPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/aluno")
  }

  return <SalesFunnel />
}
