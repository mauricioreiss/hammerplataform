"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { UserProfile, Evaluation, Workout, Exercise, Kpis } from "@/lib/types"

// --- Validation ---

const uuidSchema = z.string().uuid()

const anamneseSchema = z.object({
  user_id: z.string().uuid().optional(),
  weight: z.number().positive().max(500).optional(),
  height: z.number().positive().max(300).optional(),
  injuries: z.string().max(2000).trim().optional(),
  days_per_week: z.number().int().min(1).max(7).optional(),
  par_q_data: z.record(z.string(), z.boolean()).optional(),
})

// --- Auth ---

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

async function requireAuth(requiredRole?: string) {
  const user = await getAuthUser()
  if (!user) throw new Error("Not authenticated")

  if (requiredRole) {
    const admin = createAdminClient()
    const { data: profile } = await admin
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

// --- User Queries ---

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const user = await getAuthUser()
    if (!user) return null

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("users")
      .select("id, full_name, role, objective, plan_status, plan_name, plan_value, expire_date, created_at")
      .eq("id", user.id)
      .single()

    if (error || !data) return null
    return data as UserProfile
  } catch {
    return null
  }
}

export async function getAlunos(): Promise<UserProfile[]> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    const { data, error } = await admin
      .from("users")
      .select("id, full_name, role, objective, plan_status, plan_name, plan_value, expire_date, created_at")
      .eq("role", "student")
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as UserProfile[]
  } catch {
    return []
  }
}

export async function getAlunoById(id: string): Promise<UserProfile | null> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(id)
    if (!parsed.success) return null

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("users")
      .select("id, full_name, role, objective, plan_status, plan_name, plan_value, expire_date, created_at")
      .eq("id", parsed.data)
      .single()

    if (error || !data) return null
    return data as UserProfile
  } catch {
    return null
  }
}

export async function getAlunosAguardando(): Promise<UserProfile[]> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    // Students who have anamnesis but no approved workout
    const { data: anamneseUsers } = await admin
      .from("anamnesis")
      .select("user_id")

    const userIds = (anamneseUsers ?? [])
      .map((a) => a.user_id)
      .filter((id): id is string => id !== null)

    if (userIds.length === 0) return []

    const { data: usersWithWorkout } = await admin
      .from("workouts")
      .select("user_id")
      .eq("status", "approved")

    const approvedIds = new Set((usersWithWorkout ?? []).map((w) => w.user_id))
    const waitingIds = userIds.filter((id) => !approvedIds.has(id))

    if (waitingIds.length === 0) return []

    const { data, error } = await admin
      .from("users")
      .select("id, full_name, role, objective, plan_status, plan_name, plan_value, expire_date, created_at")
      .in("id", waitingIds)

    if (error || !data) return []
    return data as UserProfile[]
  } catch {
    return []
  }
}

// --- KPIs ---

export async function getKpis(): Promise<Kpis> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    const { count: total } = await admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")

    const { data: values } = await admin
      .from("users")
      .select("plan_value")
      .eq("role", "student")
      .not("plan_status", "eq", "atrasado")

    const mrr = (values ?? []).reduce((sum, u) => sum + (u.plan_value ?? 0), 0)

    const today = new Date().toISOString().split("T")[0]
    const { count: novos } = await admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .gte("created_at", today)

    return {
      total: total ?? 0,
      mrr: `R$ ${mrr.toLocaleString("pt-BR")}`,
      novosHoje: novos ?? 0,
    }
  } catch {
    return { total: 0, mrr: "R$ 0", novosHoje: 0 }
  }
}

// --- Student CRUD ---

export async function createAluno(data: {
  name: string
  email: string
  password: string
  objective: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    let userId: string

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

    if (authError) {
      // Auth user already exists - check if profile is missing
      if (authError.message.includes("already been registered")) {
        const { data: usersRes } = await admin.auth.admin.listUsers()
        const existing = usersRes?.users?.find((u) => u.email === data.email)
        if (!existing) {
          return { success: false, error: "Este e-mail já está cadastrado." }
        }

        // Check if profile already exists in users table
        const { data: profile } = await admin
          .from("users")
          .select("id")
          .eq("id", existing.id)
          .maybeSingle()

        if (profile) {
          return { success: false, error: "Este aluno já está cadastrado." }
        }

        // Auth exists but profile is missing - recover
        userId = existing.id
      } else {
        return { success: false, error: authError.message }
      }
    } else if (!authUser.user) {
      return { success: false, error: "Falha ao criar conta." }
    } else {
      userId = authUser.user.id
    }

    const { error: insertError } = await admin.from("users").insert({
      id: userId,
      full_name: data.name,
      role: "student",
      objective: data.objective,
      plan_status: "ativo",
      plan_name: "Mensal",
      plan_value: 150,
    })

    if (insertError) {
      return { success: false, error: `Falha ao salvar perfil: ${insertError.message}` }
    }

    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- Evaluations ---

export async function getAvaliacoes(userId: string): Promise<Evaluation[]> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(userId)
    if (!parsed.success) return []

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("evaluations")
      .select("*")
      .eq("user_id", parsed.data)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as Evaluation[]
  } catch {
    return []
  }
}

export async function getEvolucaoAluno(): Promise<Evaluation[]> {
  try {
    const user = await getAuthUser()
    if (!user) return []

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("evaluations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as Evaluation[]
  } catch {
    return []
  }
}

export async function saveAvaliacao(evalData: {
  userId: string
  date: string
  weight?: number
  bodyFat?: number
  leanMass?: number
  waist?: number
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    const { error } = await admin.from("evaluations").insert({
      user_id: evalData.userId,
      date: evalData.date,
      weight: evalData.weight,
      body_fat: evalData.bodyFat,
      lean_mass: evalData.leanMass,
      waist: evalData.waist,
    })

    if (error) return { success: false, error: error.message }

    revalidatePath(`/admin/alunos/${evalData.userId}`)
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- Workouts ---

export async function getWorkoutsDoAluno(): Promise<Workout[]> {
  try {
    const user = await getAuthUser()
    if (!user) return []

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("workouts")
      .select("id, user_id, title, is_ai_draft, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as Workout[]
  } catch {
    return []
  }
}

export async function getWorkoutComExercicios(workoutId: string): Promise<Workout | null> {
  try {
    const user = await getAuthUser()
    if (!user) return null

    const parsed = uuidSchema.safeParse(workoutId)
    if (!parsed.success) return null

    const admin = createAdminClient()

    const { data: workout, error } = await admin
      .from("workouts")
      .select("id, user_id, title, is_ai_draft, status, created_at")
      .eq("id", parsed.data)
      .single()

    if (error || !workout) return null

    // Students can only see their own workouts
    const { data: profile } = await admin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role === "student" && workout.user_id !== user.id) return null

    const { data: exercises } = await admin
      .from("exercises")
      .select("id, workout_id, name, muscle_group, sets, reps, rest, note, illustration_url")
      .eq("workout_id", parsed.data)
      .order("created_at", { ascending: true })

    return {
      ...workout,
      exercises: (exercises ?? []) as Exercise[],
    } as Workout
  } catch {
    return null
  }
}

export async function getTreinosPorAluno(userId: string): Promise<Workout[]> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(userId)
    if (!parsed.success) return []

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("workouts")
      .select("id, user_id, title, is_ai_draft, status, created_at")
      .eq("user_id", parsed.data)
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data as Workout[]
  } catch {
    return []
  }
}

// --- Workout Builder (Admin) ---

export async function getLibraryExercises(): Promise<Exercise[]> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    const { data, error } = await admin
      .from("exercises")
      .select("id, workout_id, name, muscle_group, sets, reps, rest, note, illustration_url")
      .is("workout_id", null)
      .order("name", { ascending: true })

    if (error || !data) return []
    return data as Exercise[]
  } catch {
    return []
  }
}

export async function getTreinosComExercicios(userId: string): Promise<Workout[]> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(userId)
    if (!parsed.success) return []

    const admin = createAdminClient()
    const { data: workouts, error } = await admin
      .from("workouts")
      .select("id, user_id, title, is_ai_draft, status, created_at")
      .eq("user_id", parsed.data)
      .order("created_at", { ascending: false })

    if (error || !workouts || workouts.length === 0) return []

    const workoutIds = workouts.map((w) => w.id)
    const { data: exercises } = await admin
      .from("exercises")
      .select("id, workout_id, name, muscle_group, sets, reps, rest, note, illustration_url")
      .in("workout_id", workoutIds)

    const byWorkout = new Map<string, Exercise[]>()
    for (const ex of (exercises ?? []) as Exercise[]) {
      const list = byWorkout.get(ex.workout_id!) ?? []
      list.push(ex)
      byWorkout.set(ex.workout_id!, list)
    }

    return workouts.map((w) => ({
      ...w,
      exercises: byWorkout.get(w.id) ?? [],
    })) as Workout[]
  } catch {
    return []
  }
}

export async function createWorkoutWithExercises(
  userId: string,
  title: string,
  exercises: Array<{
    name: string
    muscleGroup: string
    sets: string
    reps: string
    rest: string
    note?: string
    illustrationUrl?: string
  }>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(userId)
    if (!parsed.success) return { success: false, error: "ID invalido." }
    if (!title.trim()) return { success: false, error: "Titulo obrigatorio." }
    if (exercises.length === 0) return { success: false, error: "Adicione pelo menos um exercicio." }

    const admin = createAdminClient()

    const { data: workout, error: wErr } = await admin
      .from("workouts")
      .insert({
        user_id: parsed.data,
        title: title.trim(),
        is_ai_draft: false,
        status: "draft",
      })
      .select("id")
      .single()

    if (wErr || !workout) return { success: false, error: wErr?.message ?? "Falha ao criar ficha." }

    const rows = exercises.map((ex) => ({
      workout_id: workout.id,
      name: ex.name,
      muscle_group: ex.muscleGroup,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      note: ex.note || null,
      illustration_url: ex.illustrationUrl || null,
    }))

    const { error: exErr } = await admin.from("exercises").insert(rows)

    if (exErr) return { success: false, error: `Ficha criada, mas erro nos exercicios: ${exErr.message}` }

    revalidatePath(`/admin/alunos/${parsed.data}`)
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function removeExerciseFromWorkout(
  exerciseId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(exerciseId)
    if (!parsed.success) return { success: false, error: "ID invalido." }

    const admin = createAdminClient()
    const { error } = await admin
      .from("exercises")
      .delete()
      .eq("id", parsed.data)
      .not("workout_id", "is", null)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function updateWorkoutStatus(
  workoutId: string,
  status: "draft" | "approved",
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(workoutId)
    if (!parsed.success) return { success: false, error: "ID invalido." }

    const admin = createAdminClient()
    const { error } = await admin
      .from("workouts")
      .update({ status })
      .eq("id", parsed.data)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function deleteWorkout(
  workoutId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(workoutId)
    if (!parsed.success) return { success: false, error: "ID invalido." }

    const admin = createAdminClient()

    // Delete exercises first (cascade should handle, but being explicit)
    await admin.from("exercises").delete().eq("workout_id", parsed.data)
    const { error } = await admin.from("workouts").delete().eq("id", parsed.data)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- Exercise Logs ---

export async function getExerciseLogs(workoutId: string): Promise<string[]> {
  try {
    const user = await getAuthUser()
    if (!user) return []

    const parsed = uuidSchema.safeParse(workoutId)
    if (!parsed.success) return []

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("exercise_logs")
      .select("exercise_id")
      .eq("user_id", user.id)
      .eq("workout_id", parsed.data)

    if (error || !data) return []
    return data.map((d) => d.exercise_id)
  } catch {
    return []
  }
}

export async function toggleExerciseLog(
  exerciseId: string,
  workoutId: string,
): Promise<{ success: boolean }> {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false }

    const admin = createAdminClient()

    // Check if already completed
    const { data: existing } = await admin
      .from("exercise_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("exercise_id", exerciseId)
      .eq("workout_id", workoutId)
      .maybeSingle()

    if (existing) {
      await admin.from("exercise_logs").delete().eq("id", existing.id)
    } else {
      await admin.from("exercise_logs").insert({
        user_id: user.id,
        exercise_id: exerciseId,
        workout_id: workoutId,
      })
    }

    revalidatePath("/aluno/treino")
    return { success: true }
  } catch {
    return { success: false }
  }
}

// --- Exercises CRUD ---

export async function createExercise(data: {
  name: string
  muscleGroup: string
  illustrationUrl?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    const row: Record<string, unknown> = {
      name: data.name,
      muscle_group: data.muscleGroup,
    }
    if (data.illustrationUrl) row.illustration_url = data.illustrationUrl

    const { error } = await admin.from("exercises").insert(row)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/exercicios")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function seedDefaultExercises(): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    const defaults = [
      { name: "Supino Reto", muscle_group: "Peito" },
      { name: "Supino Inclinado", muscle_group: "Peito" },
      { name: "Agachamento Livre", muscle_group: "Pernas" },
      { name: "Leg Press 45", muscle_group: "Pernas" },
      { name: "Puxada Frontal", muscle_group: "Costas" },
      { name: "Remada Curvada", muscle_group: "Costas" },
      { name: "Desenvolvimento Militar", muscle_group: "Ombros" },
      { name: "Rosca Direta", muscle_group: "Biceps" },
      { name: "Triceps Corda", muscle_group: "Triceps" },
      { name: "Levantamento Terra", muscle_group: "Posterior" },
    ]

    const { error } = await admin.from("exercises").insert(defaults)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/exercicios")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- Anamnese ---

export async function saveAnamnese(
  formData: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = anamneseSchema.safeParse(formData)
    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(", ")
      return { success: false, error: messages }
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from("anamnesis")
      .insert(parsed.data)

    if (error) return { success: false, error: "Falha ao salvar anamnese." }
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}
