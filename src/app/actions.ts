"use server"

import { createAdminClient } from "@/lib/supabase/admin"

// --- Types ---

export type StudentRow = {
  id: string
  name: string
  email: string
  role: string
  plan: string | null
  objective: string | null
  status: string
  created_at: string
}

export type WorkoutRow = {
  id: string
  user_id: string
  title: string
  subtitle: string
  duration: string
  created_at: string
}

// --- Queries ---

export async function getAlunos(): Promise<StudentRow[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`getAlunos failed: ${error.message}`)
  }

  return data as StudentRow[]
}

export async function getTreinosPorAluno(
  userId: string,
): Promise<WorkoutRow[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`getTreinosPorAluno failed: ${error.message}`)
  }

  return data as WorkoutRow[]
}

// --- Mutations ---

export async function saveAnamnese(formData: Record<string, unknown>) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("anamnesis")
    .insert(formData)
    .select()
    .single()

  if (error) {
    throw new Error(`saveAnamnese failed: ${error.message}`)
  }

  return data
}
