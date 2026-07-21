"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type LoginResult =
  | { success: true; role: "admin" | "student"; mustChangePassword: boolean }
  | { success: false; error: string }

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  if (!email || !password) {
    return { success: false, error: "E-mail e senha obrigatórios." }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      return { success: false, error: "E-mail ou senha incorretos." }
    }

    const admin = createAdminClient()
    const { data: profile, error: profileError } = await admin
      .from("users")
      .select("role, is_first_login")
      .eq("id", data.user.id)
      .single()

    if (profileError || !profile?.role) {
      await supabase.auth.signOut()
      return {
        success: false,
        error: "Conta sem permissão de acesso.",
      }
    }

    return {
      success: true,
      role: profile.role as "admin" | "student",
      // Only students can be forced to change their password.
      mustChangePassword: profile.role === "student" && profile.is_first_login === true,
    }
  } catch {
    return { success: false, error: "Erro de conexão. Tente novamente." }
  }
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
