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

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient()
    
    // Em alta escala usaríamos um RPC, mas para o contexto atual pegamos os usuários.
    const { data, error: usersError } = await admin.auth.admin.listUsers()
    
    if (usersError) {
      console.error("[requestPasswordReset] Falha ao listar usuários do auth:", usersError)
      return { success: true } // Always return success to prevent enumeration
    }
    
    const user = data?.users?.find((u) => u.email === email)
    
    if (!user) {
      return { success: true }
    }
      
    // Busca o nome do aluno
    const { data: profile, error: profileError } = await admin
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .single()
      
    if (profileError) {
      console.error(`[requestPasswordReset] Falha ao buscar perfil do usuário ${user.id}:`, profileError)
    }
      
    const studentName = profile?.full_name || "Desconhecido"
    
    // Busca o admin
    const { data: adminUser, error: adminError } = await admin
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single()
      
    if (adminError || !adminUser) {
      console.error("[requestPasswordReset] Admin não encontrado:", adminError)
      return { success: true }
    }
      
    // Insere a notificação
    const { error: insertError } = await admin.from("notifications").insert({
      user_id: adminUser.id,
      title: "Solicitação de Reset de Senha",
      message: `O aluno ${studentName} (${email}) solicitou redefinição de senha. Acesse o perfil do aluno para redefinir a senha.`
    })
    
    if (insertError) {
      console.error("[requestPasswordReset] Falha ao inserir notificação:", insertError)
    }
    
    return { success: true }
  } catch (err) {
    console.error("[requestPasswordReset] Falha fatal não tratada:", err)
    return { success: false, error: "Erro interno ao processar a solicitação." }
  }
}
