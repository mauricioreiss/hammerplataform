"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { UserProfile, Evaluation, Workout, Exercise, Kpis, Plan, Notification } from "@/lib/types"

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

export async function getAuthEmail(): Promise<string> {
  const user = await getAuthUser()
  return user?.email ?? ""
}

// --- User Queries ---

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const user = await getAuthUser()
    if (!user) return null

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("users")
      .select("id, full_name, role, objective, plan_status, plan_name, plan_value, expire_date, avatar_url, pix_key, is_first_login, created_at")
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
      .select("id, full_name, role, objective, plan_status, plan_name, plan_value, expire_date, avatar_url, created_at")
      .eq("role", "student")
      .order("created_at", { ascending: false })

    if (error || !data) return []
    return data.map((u) => ({ ...u, pix_key: null })) as UserProfile[]
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
      .select("id, full_name, role, objective, plan_status, plan_name, plan_value, expire_date, avatar_url, created_at")
      .eq("id", parsed.data)
      .single()

    if (error || !data) return null
    return { ...data, pix_key: null } as UserProfile
  } catch {
    return null
  }
}

export async function getAlunosAguardando(): Promise<UserProfile[]> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    // Parallel: fetch anamnesis IDs and approved workout IDs at the same time
    const [{ data: anamneseUsers }, { data: usersWithWorkout }] = await Promise.all([
      admin.from("anamnesis").select("user_id"),
      admin.from("workouts").select("user_id").in("status", ["published", "approved"]),
    ])

    const userIds = (anamneseUsers ?? [])
      .map((a) => a.user_id)
      .filter((id): id is string => id !== null)

    if (userIds.length === 0) return []

    const approvedIds = new Set((usersWithWorkout ?? []).map((w) => w.user_id))
    const waitingIds = userIds.filter((id) => !approvedIds.has(id))

    if (waitingIds.length === 0) return []

    const { data, error } = await admin
      .from("users")
      .select("id, full_name, role, objective, plan_status, plan_name, plan_value, expire_date, avatar_url, created_at")
      .in("id", waitingIds)

    if (error || !data) return []
    return data.map((u) => ({ ...u, pix_key: null })) as UserProfile[]
  } catch {
    return []
  }
}

// --- KPIs ---

export async function getKpis(): Promise<Kpis> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    const today = new Date().toISOString().split("T")[0]

    const [{ count: total }, { data: values }, { count: novos }] = await Promise.all([
      admin.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
      admin.from("users").select("plan_value").eq("role", "student").not("plan_status", "eq", "atrasado"),
      admin.from("users").select("id", { count: "exact", head: true }).eq("role", "student").gte("created_at", today),
    ])

    const mrr = (values ?? []).reduce((sum, u) => sum + (u.plan_value ?? 0), 0)

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

const CYCLE_DAYS: Record<string, number> = {
  mensal: 30,
  semestral: 180,
  anual: 365,
}

export async function createAluno(data: {
  name: string
  email: string
  password: string
  objective: string
  planId: string
  paymentReceived: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    // Fetch plan details
    let planName = "Mensal"
    let planValue = 150
    let planCycle = "mensal"

    if (data.planId) {
      const parsed = uuidSchema.safeParse(data.planId)
      if (parsed.success) {
        const { data: plan } = await admin
          .from("plans")
          .select("name, price, cycle")
          .eq("id", parsed.data)
          .single()

        if (plan) {
          planName = plan.name
          planValue = plan.price
          planCycle = plan.cycle
        }
      }
    }

    let userId: string

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes("already been registered")) {
        const { data: usersRes } = await admin.auth.admin.listUsers()
        const existing = usersRes?.users?.find((u) => u.email === data.email)
        if (!existing) {
          return { success: false, error: "Este e-mail ja esta cadastrado." }
        }

        const { data: profile } = await admin
          .from("users")
          .select("id")
          .eq("id", existing.id)
          .maybeSingle()

        if (profile) {
          return { success: false, error: "Este aluno ja esta cadastrado." }
        }

        userId = existing.id
      } else {
        return { success: false, error: authError.message }
      }
    } else if (!authUser.user) {
      return { success: false, error: "Falha ao criar conta." }
    } else {
      userId = authUser.user.id
    }

    const days = CYCLE_DAYS[planCycle] ?? 30
    const expireDate = data.paymentReceived
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      : null

    const { error: insertError } = await admin.from("users").insert({
      id: userId,
      full_name: data.name,
      role: "student",
      objective: data.objective,
      plan_status: data.paymentReceived ? "ativo" : "pending",
      plan_name: planName,
      plan_value: planValue,
      expire_date: expireDate,
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
  photoUrl?: string
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
      photo_url: evalData.photoUrl || null,
    })

    if (error) return { success: false, error: error.message }

    revalidatePath(`/admin/alunos/${evalData.userId}`)
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function uploadAvaliacaoPhoto(
  userId: string,
  formData: FormData,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await requireAuth("admin")

    const file = formData.get("file") as File | null
    if (!file || file.size === 0) return { success: false, error: "Nenhum arquivo." }

    const allowed = ["image/png", "image/jpeg", "image/webp"]
    if (!allowed.includes(file.type)) return { success: false, error: "Formato invalido. Use PNG, JPG ou WEBP." }
    if (file.size > 5 * 1024 * 1024) return { success: false, error: "Maximo 5MB." }

    const admin = createAdminClient()
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `avaliacoes/${userId}/${Date.now()}.${ext}`
    const buf = await file.arrayBuffer()

    const { error: upErr } = await admin.storage
      .from("avaliacoes")
      .upload(path, buf, { contentType: file.type, upsert: false })

    if (upErr) return { success: false, error: upErr.message }

    const { data: urlData } = admin.storage.from("avaliacoes").getPublicUrl(path)
    return { success: true, url: urlData.publicUrl }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function getAnamneseByUserId(userId: string) {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(userId)
    if (!parsed.success) return null

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("anamnesis")
      .select("*")
      .eq("user_id", parsed.data)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

// --- Workouts ---

export async function getWorkoutsDoAluno(): Promise<Workout[]> {
  try {
    const user = await getAuthUser()
    if (!user) return []

    const admin = createAdminClient()

    // Only show published workouts to students
    const { data: workouts, error } = await admin
      .from("workouts")
      .select("id, user_id, title, icon, is_ai_draft, status, created_at")
      .eq("user_id", user.id)
      .in("status", ["published", "approved"])
      .order("created_at", { ascending: false })

    if (error || !workouts || workouts.length === 0) return []

    // Fetch exercises for all workouts
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

export async function getWorkoutComExercicios(workoutId: string): Promise<Workout | null> {
  try {
    const user = await getAuthUser()
    if (!user) return null

    const parsed = uuidSchema.safeParse(workoutId)
    if (!parsed.success) return null

    const admin = createAdminClient()

    // Parallel: fetch workout and user role at the same time
    const [{ data: workout, error }, { data: profile }] = await Promise.all([
      admin
        .from("workouts")
        .select("id, user_id, title, icon, is_ai_draft, status, created_at")
        .eq("id", parsed.data)
        .single(),
      admin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single(),
    ])

    if (error || !workout) return null
    if (profile?.role === "student" && workout.user_id !== user.id) return null

    const { data: exercises } = await admin
      .from("exercises")
      .select("id, workout_id, name, muscle_group, sets, reps, rest, note, illustration_url")
      .eq("workout_id", parsed.data)

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
      .select("id, user_id, title, icon, is_ai_draft, status, created_at")
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
      .select("id, user_id, title, icon, is_ai_draft, status, created_at")
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
  icon?: string,
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
        icon: icon?.trim() || null,
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

export async function updateWorkoutTitle(
  workoutId: string,
  title: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(workoutId)
    if (!parsed.success) return { success: false, error: "ID invalido." }
    if (!title.trim()) return { success: false, error: "Titulo obrigatorio." }

    const admin = createAdminClient()
    const { error } = await admin
      .from("workouts")
      .update({ title: title.trim() })
      .eq("id", parsed.data)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function addExerciseToWorkout(
  workoutId: string,
  data: {
    name: string
    muscleGroup: string
    sets: string
    reps: string
    rest: string
    note?: string
    illustrationUrl?: string
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(workoutId)
    if (!parsed.success) return { success: false, error: "ID invalido." }

    const admin = createAdminClient()
    const { error } = await admin.from("exercises").insert({
      workout_id: parsed.data,
      name: data.name,
      muscle_group: data.muscleGroup,
      sets: data.sets,
      reps: data.reps,
      rest: data.rest,
      note: data.note || null,
      illustration_url: data.illustrationUrl || null,
    })

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/alunos")
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
  status: "draft" | "published",
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

    // Notify student when workout is published
    if (status === "published") {
      const { data: workout } = await admin
        .from("workouts")
        .select("user_id")
        .eq("id", parsed.data)
        .single()

      if (workout?.user_id) {
        await insertNotification(
          workout.user_id,
          "Nova ficha de treino!",
          "Sua nova ficha de treino ja esta disponivel. Bora treinar!",
        )
      }
    }

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

    const gh = (path: string) =>
      `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${path}`
    const ph = (name: string) =>
      `https://placehold.co/600x400/09090b/ef4444?text=${encodeURIComponent(name)}`

    const defaults = [
      { name: "Supino Reto", muscle_group: "Peito", illustration_url: gh("Barbell_Bench_Press_-_Medium_Grip/0.jpg") },
      { name: "Supino Inclinado", muscle_group: "Peito", illustration_url: gh("Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg") },
      { name: "Supino Declinado", muscle_group: "Peito", illustration_url: ph("Supino Declinado") },
      { name: "Crucifixo com Halteres", muscle_group: "Peito", illustration_url: ph("Crucifixo") },
      { name: "Crossover", muscle_group: "Peito", illustration_url: ph("Crossover") },
      { name: "Puxada Frontal", muscle_group: "Costas", illustration_url: gh("Band_Assisted_Pull-Up/0.jpg") },
      { name: "Remada Curvada", muscle_group: "Costas", illustration_url: gh("Bent_Over_Barbell_Row/0.jpg") },
      { name: "Remada Unilateral", muscle_group: "Costas", illustration_url: gh("Bent_Over_One-Arm_Long_Bar_Row/0.jpg") },
      { name: "Puxada Supinada", muscle_group: "Costas", illustration_url: ph("Puxada Supinada") },
      { name: "Remada Cavaleiro", muscle_group: "Costas", illustration_url: ph("Remada Cavaleiro") },
      { name: "Desenvolvimento Militar", muscle_group: "Ombros", illustration_url: gh("Barbell_Shoulder_Press/0.jpg") },
      { name: "Elevacao Lateral", muscle_group: "Ombros", illustration_url: gh("Alternating_Deltoid_Raise/0.jpg") },
      { name: "Elevacao Frontal", muscle_group: "Ombros", illustration_url: ph("Elevacao Frontal") },
      { name: "Crucifixo Inverso", muscle_group: "Ombros", illustration_url: gh("Back_Flyes_-_With_Bands/0.jpg") },
      { name: "Rosca Direta", muscle_group: "Biceps", illustration_url: gh("Barbell_Curl/0.jpg") },
      { name: "Rosca Alternada", muscle_group: "Biceps", illustration_url: gh("Alternate_Hammer_Curl/0.jpg") },
      { name: "Rosca Martelo", muscle_group: "Biceps", illustration_url: gh("Alternate_Hammer_Curl/0.jpg") },
      { name: "Triceps Corda", muscle_group: "Triceps", illustration_url: ph("Triceps Corda") },
      { name: "Triceps Testa", muscle_group: "Triceps", illustration_url: gh("Band_Skull_Crusher/0.jpg") },
      { name: "Triceps Mergulho", muscle_group: "Triceps", illustration_url: gh("Bench_Dips/0.jpg") },
      { name: "Agachamento Livre", muscle_group: "Pernas", illustration_url: gh("Barbell_Squat/0.jpg") },
      { name: "Leg Press 45", muscle_group: "Pernas", illustration_url: ph("Leg Press 45") },
      { name: "Cadeira Extensora", muscle_group: "Pernas", illustration_url: ph("Extensora") },
      { name: "Cadeira Flexora", muscle_group: "Pernas", illustration_url: gh("Ball_Leg_Curl/0.jpg") },
      { name: "Hack Squat", muscle_group: "Pernas", illustration_url: gh("Barbell_Hack_Squat/0.jpg") },
      { name: "Afundo", muscle_group: "Pernas", illustration_url: gh("Barbell_Lunge/0.jpg") },
      { name: "Levantamento Terra", muscle_group: "Posterior", illustration_url: gh("Barbell_Deadlift/0.jpg") },
      { name: "Stiff", muscle_group: "Posterior", illustration_url: ph("Stiff") },
      { name: "Mesa Flexora", muscle_group: "Posterior", illustration_url: gh("Ball_Leg_Curl/0.jpg") },
      { name: "Hip Thrust", muscle_group: "Gluteos", illustration_url: gh("Barbell_Hip_Thrust/0.jpg") },
      { name: "Elevacao Pelvica", muscle_group: "Gluteos", illustration_url: gh("Barbell_Glute_Bridge/0.jpg") },
      { name: "Abdominal Crunch", muscle_group: "Abdomen", illustration_url: gh("Ab_Crunch_Machine/0.jpg") },
      { name: "Prancha Isometrica", muscle_group: "Abdomen", illustration_url: ph("Prancha") },
    ]

    const { error } = await admin.from("exercises").insert(defaults)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/exercicios")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- Avatar ---

export async function updateAvatarUrl(
  url: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, error: "Nao autenticado." }

    const admin = createAdminClient()
    const { error } = await admin
      .from("users")
      .update({ avatar_url: url })
      .eq("id", user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath("/aluno")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- Admin Profile ---

export async function updateAdminProfile(data: {
  fullName: string
  avatarUrl?: string
  pixKey?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireAuth("admin")
    const admin = createAdminClient()

    const updates: Record<string, unknown> = {}
    if (data.fullName.trim()) updates.full_name = data.fullName.trim()
    if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl || null
    if (data.pixKey !== undefined) updates.pix_key = data.pixKey || null

    const { error } = await admin
      .from("users")
      .update(updates)
      .eq("id", user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- Reset Password ---

export async function resetStudentPassword(
  userId: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(userId)
    if (!parsed.success) return { success: false, error: "ID invalido." }
    if (!newPassword || newPassword.length < 6) return { success: false, error: "Senha deve ter no minimo 6 caracteres." }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(parsed.data, {
      password: newPassword,
    })

    if (error) return { success: false, error: error.message }

    // Force student to change password on next login
    await admin
      .from("users")
      .update({ is_first_login: true })
      .eq("id", parsed.data)

    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- First Login Password Change ---

export async function updateInitialPassword(
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, error: "Nao autenticado." }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Senha deve ter no minimo 6 caracteres." }
    }

    const supabase = await createClient()
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (authError) return { success: false, error: authError.message }

    const admin = createAdminClient()
    await admin
      .from("users")
      .update({ is_first_login: false })
      .eq("id", user.id)

    revalidatePath("/aluno")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- Student Quick Status ---

export async function getStudentQuickStatus(
  userId: string,
): Promise<{ lastEvalDate: string | null; completedExercises: number }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(userId)
    if (!parsed.success) return { lastEvalDate: null, completedExercises: 0 }

    const admin = createAdminClient()

    const [evalResult, logsResult] = await Promise.all([
      admin
        .from("evaluations")
        .select("date")
        .eq("user_id", parsed.data)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("exercise_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", parsed.data),
    ])

    return {
      lastEvalDate: evalResult.data?.date ?? null,
      completedExercises: logsResult.count ?? 0,
    }
  } catch {
    return { lastEvalDate: null, completedExercises: 0 }
  }
}

// --- Admin PIX Key (for student payment page) ---

export async function getAdminPixKey(): Promise<string> {
  try {
    const user = await getAuthUser()
    if (!user) return ""

    const admin = createAdminClient()
    const { data } = await admin
      .from("users")
      .select("pix_key")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle()

    return data?.pix_key ?? process.env.NEXT_PUBLIC_PIX_KEY ?? ""
  } catch {
    return process.env.NEXT_PUBLIC_PIX_KEY ?? ""
  }
}

// --- Anamnese (admin-only, used by IA module) ---

export async function saveAnamnese(
  formData: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")

    const parsed = anamneseSchema.safeParse(formData)
    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(", ")
      return { success: false, error: messages }
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from("anamnesis")
      .insert(parsed.data)

    if (error) {
      console.error("saveAnamnese insert error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    console.error("saveAnamnese unexpected error:", err)
    return { success: false, error: err instanceof Error ? err.message : "Erro inesperado." }
  }
}

// --- Landing Page Registration (public, no auth required) ---

const registerSchema = z.object({
  email: z.string().email("E-mail invalido."),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres."),
  name: z.string().min(2, "Nome obrigatorio.").max(200),
  plan_id: z.string().uuid("Selecione um plano."),
  objective: z.string().max(200).optional(),
  weight: z.number().positive().max(500).optional(),
  height: z.number().positive().max(300).optional(),
  injuries: z.string().max(2000).trim().optional(),
  days_per_week: z.number().int().min(1).max(7).optional(),
  par_q_data: z.record(z.string(), z.boolean()).optional(),
})

export async function registerFromLanding(
  formData: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message).join(", ")
    return { success: false, error: messages }
  }

  const { email, password, name, plan_id, objective, weight, height, injuries, days_per_week, par_q_data } = parsed.data
  const admin = createAdminClient()

  // 1. Look up selected plan
  const { data: plan } = await admin
    .from("plans")
    .select("name, price")
    .eq("id", plan_id)
    .single()

  if (!plan) {
    return { success: false, error: "Plano selecionado nao encontrado." }
  }

  // 2. Create auth user
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    console.error("registerFromLanding auth error:", authError)
    if (authError.message.includes("already been registered")) {
      return { success: false, error: "Este e-mail ja esta cadastrado." }
    }
    return { success: false, error: authError.message }
  }

  if (!authUser.user) {
    return { success: false, error: "Falha ao criar conta." }
  }

  const userId = authUser.user.id

  // 2. Insert into users table
  const { error: userError } = await admin.from("users").insert({
    id: userId,
    full_name: name,
    role: "student",
    objective: objective || null,
    plan_status: "pending",
    plan_name: plan.name,
    plan_value: plan.price,
    is_first_login: false,
  })

  if (userError) {
    console.error("registerFromLanding users insert error:", userError)
    return { success: false, error: `Falha ao criar perfil: ${userError.message}` }
  }

  // 3. Insert anamnesis
  const anamnesisPayload: Record<string, unknown> = { user_id: userId }
  if (weight !== undefined) anamnesisPayload.weight = weight
  if (height !== undefined) anamnesisPayload.height = height
  if (injuries !== undefined) anamnesisPayload.injuries = injuries
  if (days_per_week !== undefined) anamnesisPayload.days_per_week = days_per_week
  if (par_q_data !== undefined) anamnesisPayload.par_q_data = par_q_data

  const { error: anamError } = await admin.from("anamnesis").insert(anamnesisPayload)

  if (anamError) {
    console.error("registerFromLanding anamnesis insert error:", anamError)
    return { success: false, error: `Falha ao salvar anamnese: ${anamError.message}` }
  }

  // 4. Notify admin about new registration
  const { data: admins } = await admin
    .from("users")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single()

  if (admins?.id) {
    await insertNotification(
      admins.id,
      "Novo aluno cadastrado",
      `${name} se cadastrou pela landing page e aguarda liberacao.`,
    )
  }

  return { success: true }
}

// --- Plans CRUD ---

export async function getPlans(): Promise<Plan[]> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    const { data, error } = await admin
      .from("plans")
      .select("id, name, price, cycle, created_at")
      .order("price", { ascending: true })

    if (error || !data) return []
    return data as Plan[]
  } catch {
    return []
  }
}

export async function getPublicPlans(): Promise<Plan[]> {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("plans")
      .select("id, name, price, cycle, created_at")
      .order("price", { ascending: true })

    if (error || !data) return []
    return data as Plan[]
  } catch {
    return []
  }
}

export async function createPlan(data: {
  name: string
  price: number
  cycle: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const admin = createAdminClient()

    const { error } = await admin.from("plans").insert({
      name: data.name,
      price: data.price,
      cycle: data.cycle,
    })

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/configuracoes")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function updatePlan(
  id: string,
  data: { name: string; price: number; cycle: string },
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(id)
    if (!parsed.success) return { success: false, error: "ID invalido." }

    const admin = createAdminClient()

    const { error } = await admin
      .from("plans")
      .update({ name: data.name, price: data.price, cycle: data.cycle })
      .eq("id", parsed.data)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/configuracoes")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function deletePlan(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(id)
    if (!parsed.success) return { success: false, error: "ID invalido." }

    const admin = createAdminClient()

    const { error } = await admin
      .from("plans")
      .delete()
      .eq("id", parsed.data)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/configuracoes")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- Financial Management ---

export async function registerPayment(studentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(studentId)
    if (!parsed.success) return { success: false, error: "ID invalido." }

    const admin = createAdminClient()

    const { data: student, error: fetchErr } = await admin
      .from("users")
      .select("plan_name")
      .eq("id", parsed.data)
      .single()

    if (fetchErr || !student) return { success: false, error: "Aluno nao encontrado." }

    const cycleName = (student.plan_name ?? "Mensal").toLowerCase()
    const days = CYCLE_DAYS[cycleName] ?? 30
    const expireDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    const { error } = await admin
      .from("users")
      .update({ plan_status: "ativo", expire_date: expireDate })
      .eq("id", parsed.data)

    if (error) return { success: false, error: error.message }

    await insertNotification(
      parsed.data,
      "Pagamento confirmado!",
      "Seu pagamento foi registrado e seu treino esta liberado.",
    )

    revalidatePath(`/admin/alunos/${parsed.data}`)
    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function notifyPaymentMade(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false, error: "Nao autenticado." }

    const admin = createAdminClient()

    const { data: profile } = await admin
      .from("users")
      .select("plan_status, full_name")
      .eq("id", user.id)
      .single()

    if (!profile) return { success: false, error: "Perfil nao encontrado." }
    if (profile.plan_status !== "pending") {
      return { success: false, error: "Status atual nao permite essa acao." }
    }

    const { error } = await admin
      .from("users")
      .update({ plan_status: "review" })
      .eq("id", user.id)

    if (error) return { success: false, error: error.message }

    // Notify admin
    const { data: adminUser } = await admin
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .single()

    if (adminUser?.id) {
      await insertNotification(
        adminUser.id,
        "Pagamento sinalizado",
        `${profile.full_name} informou que realizou o pagamento e aguarda validacao.`,
      )
    }

    revalidatePath("/aluno/assinatura")
    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function blockStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(studentId)
    if (!parsed.success) return { success: false, error: "ID invalido." }

    const admin = createAdminClient()

    const { error } = await admin
      .from("users")
      .update({ plan_status: "blocked" })
      .eq("id", parsed.data)

    if (error) return { success: false, error: error.message }

    revalidatePath(`/admin/alunos/${parsed.data}`)
    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function unblockStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(studentId)
    if (!parsed.success) return { success: false, error: "ID invalido." }

    const admin = createAdminClient()

    const { data: profile } = await admin
      .from("users")
      .select("expire_date")
      .eq("id", parsed.data)
      .single()

    const isExpired = profile?.expire_date && new Date(profile.expire_date) < new Date()
    const newStatus = isExpired ? "pending" : "active"

    const { error } = await admin
      .from("users")
      .update({ plan_status: newStatus })
      .eq("id", parsed.data)

    if (error) return { success: false, error: error.message }

    revalidatePath(`/admin/alunos/${parsed.data}`)
    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

export async function deleteStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(studentId)
    if (!parsed.success) return { success: false, error: "ID invalido." }

    const admin = createAdminClient()

    // 1. Get workout IDs to delete their exercises
    const { data: workouts } = await admin
      .from("workouts")
      .select("id")
      .eq("user_id", parsed.data)

    const workoutIds = (workouts ?? []).map((w) => w.id)

    // 2. Delete in dependency order (child tables first)
    if (workoutIds.length > 0) {
      await admin.from("exercise_logs").delete().in("workout_id", workoutIds)
      await admin.from("exercises").delete().in("workout_id", workoutIds)
    }

    await Promise.all([
      admin.from("exercise_logs").delete().eq("user_id", parsed.data),
      admin.from("workouts").delete().eq("user_id", parsed.data),
      admin.from("evaluations").delete().eq("user_id", parsed.data),
      admin.from("anamnesis").delete().eq("user_id", parsed.data),
      admin.from("notifications").delete().eq("user_id", parsed.data),
    ])

    // 3. Delete user profile
    const { error: userError } = await admin
      .from("users")
      .delete()
      .eq("id", parsed.data)

    if (userError) return { success: false, error: userError.message }

    // 4. Delete auth credential
    const { error: authError } = await admin.auth.admin.deleteUser(parsed.data)
    if (authError) {
      console.error("deleteStudent auth cleanup error:", authError)
    }

    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}

// --- Notifications ---

async function insertNotification(userId: string, title: string, message: string) {
  try {
    const admin = createAdminClient()
    await admin.from("notifications").insert({ user_id: userId, title, message })
  } catch {
    // Non-blocking: notification failure should not break the main operation
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const user = await getAuthUser()
    if (!user) return 0

    const admin = createAdminClient()
    const { count, error } = await admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const user = await getAuthUser()
    if (!user) return []

    const admin = createAdminClient()
    const { data, error } = await admin
      .from("notifications")
      .select("id, user_id, title, message, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error || !data) return []
    return data as Notification[]
  } catch {
    return []
  }
}

export async function markNotificationsRead(): Promise<{ success: boolean }> {
  try {
    const user = await getAuthUser()
    if (!user) return { success: false }

    const admin = createAdminClient()
    await admin
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    revalidatePath("/aluno")
    revalidatePath("/admin")
    return { success: true }
  } catch {
    return { success: false }
  }
}

// --- Update Workout With Exercises ---

export async function updateWorkoutWithExercises(
  workoutId: string,
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
  icon?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth("admin")
    const parsed = uuidSchema.safeParse(workoutId)
    if (!parsed.success) return { success: false, error: "ID invalido." }
    if (!title.trim()) return { success: false, error: "Titulo obrigatorio." }
    if (exercises.length === 0) return { success: false, error: "Adicione pelo menos um exercicio." }

    const admin = createAdminClient()

    const updateData: Record<string, unknown> = { title: title.trim() }
    if (icon !== undefined) updateData.icon = icon || null

    const { error: updateErr } = await admin
      .from("workouts")
      .update(updateData)
      .eq("id", parsed.data)

    if (updateErr) return { success: false, error: updateErr.message }

    // Delete existing exercises and insert new ones
    await admin.from("exercises").delete().eq("workout_id", parsed.data)

    const rows = exercises.map((ex) => ({
      workout_id: parsed.data,
      name: ex.name.trim(),
      muscle_group: ex.muscleGroup || null,
      sets: ex.sets || null,
      reps: ex.reps || null,
      rest: ex.rest || null,
      note: ex.note || null,
      illustration_url: ex.illustrationUrl || null,
    }))

    const { error: insertErr } = await admin.from("exercises").insert(rows)
    if (insertErr) return { success: false, error: insertErr.message }

    revalidatePath("/admin/alunos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro de conexao." }
  }
}
