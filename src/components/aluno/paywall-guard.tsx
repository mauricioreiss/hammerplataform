"use client"

import { usePathname } from "next/navigation"
import { redirect } from "next/navigation"
import type { UserProfile } from "@/lib/types"

type PaywallGuardProps = {
  user: UserProfile | null
  children: React.ReactNode
}

export function PaywallGuard({ user, children }: PaywallGuardProps) {
  const pathname = usePathname()
  const isAssinatura = pathname === "/aluno/assinatura"

  if (user && user.role !== "admin" && !isAssinatura) {
    const isBlocked = user.plan_status === "blocked" || user.plan_status === "pending" || user.plan_status === "review"
    const isExpired = user.expire_date && new Date(user.expire_date) < new Date()

    if (isBlocked || isExpired) {
      redirect("/aluno/assinatura")
    }
  }

  return <>{children}</>
}
