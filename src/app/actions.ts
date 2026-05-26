"use server"

import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// --- Types ---

export type StudentRow = {
  id: string
  full_name: string
  role: string
  objective: string | null
  plan_status: string | null
  expire_date: string | null
  created_at: string
}

export type WorkoutRow = {
  id: string
  user_id: string
  title: string
  is_ai_draft: boolean
  status: string | null
  created_at: string
}

// --- A03: Validation Schemas ---

const uuidSchema = z.string().uuid("ID must be a valid UUID")

const anamneseSchema = z.object({
  user_id: z.string().uuid().optional(),
  weight: z.number().positive().max(500).optional(),
  height: z.number().positive().max(300).optional(),
  injuries: z.string().max(2000).trim().optional(),
  days_per_week: z.number().int().min(1).max(7).optional(),
  par_q_data: z.record(z.string(), z.boolean()).optional(),
})

// --- A01: Auth Helper ---

async function requireAuth(requiredRole?: string) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Not authenticated")
  }

  if (requiredRole) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== requiredRole) {
      throw new Error("Forbidden")
    }
  }

  return user
}

// --- Queries ---

export async function getAlunos(): Promise<StudentRow[]> {
  await requireAuth("admin")

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, role, objective, plan_status, expire_date, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to fetch students")
  }

  return data as StudentRow[]
}

export async function getTreinosPorAluno(
  userId: string,
): Promise<WorkoutRow[]> {
  const user = await requireAuth()

  // A03: Validate UUID format
  const parsed = uuidSchema.safeParse(userId)
  if (!parsed.success) {
    throw new Error("Invalid user ID format")
  }

  // A01: Students can only access their own workouts
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role === "student" && user.id !== userId) {
    throw new Error("Forbidden")
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from("workouts")
    .select("id, user_id, title, is_ai_draft, status, created_at")
    .eq("user_id", parsed.data)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to fetch workouts")
  }

  return data as WorkoutRow[]
}

// --- Mutations ---

export async function saveAnamnese(formData: Record<string, unknown>) {
  // A03: Validate and sanitize input
  const parsed = anamneseSchema.safeParse(formData)
  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message).join(", ")
    throw new Error(`Validation failed: ${messages}`)
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("anamnesis")
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    throw new Error("Failed to save anamnesis")
  }

  return data
}
