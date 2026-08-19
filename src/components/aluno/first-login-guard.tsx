"use client";

import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
import type { UserProfile } from "@/lib/types";

type FirstLoginGuardProps = {
  user: UserProfile | null;
  children: React.ReactNode;
};

export function FirstLoginGuard({ user, children }: FirstLoginGuardProps) {
  const pathname = usePathname();
  const isChangePassword = pathname === "/aluno/trocar-senha";
  const isAssinatura = pathname === "/aluno/assinatura";

  if (
    user &&
    user.role !== "admin" &&
    !isChangePassword &&
    !isAssinatura &&
    user.is_first_login
  ) {
    redirect("/aluno/trocar-senha");
  }

  return <>{children}</>;
}
