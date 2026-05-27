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

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { success: false, error: "E-mail ou senha incorretos." }
  }

  // Use admin client to bypass RLS on users table
  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single()

  if (!profile?.role) {
    const debugInfo = `uid=${data.user.id} | profile=${JSON.stringify(profile)} | err=${profileError?.message ?? "none"}`
    await supabase.auth.signOut()
    return { success: false, error: `Sem permissao. Debug: ${debugInfo}` }
  }

  return { success: true, role: profile.role as "admin" | "student" }
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
