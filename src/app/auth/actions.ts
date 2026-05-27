"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type LoginResult =
  | { success: true; role: "admin" | "student" }
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
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profileError || !profile?.role) {
      const dbUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()
      await supabase.auth.signOut()
      return {
        success: false,
        error: `Debug: url=${dbUrl.slice(-30)} | uid=${data.user.id.slice(0, 8)} | profile=${JSON.stringify(profile)} | err=${profileError?.message ?? "none"}`,
      }
    }

    return { success: true, role: profile.role as "admin" | "student" }
  } catch {
    return { success: false, error: "Erro de conexão. Tente novamente." }
  }
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
