"use server"

import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// --- Types ---

export type ExerciseRow = {
  id: string
  workout_id: string | null
  name: string
  sets: string | null
  reps: string | null
  rest: string | null
  note: string | null
  illustration_url: string | null
  created_at: string
}

// --- Validation ---

const uuidSchema = z.string().uuid("ID must be a valid UUID")

// --- Auth ---

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Not authenticated")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Forbidden")
  }

  return user
}

// --- Queries ---

export async function getExercises(): Promise<ExerciseRow[]> {
  await requireAdmin()

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("exercises")
    .select("id, workout_id, name, sets, reps, rest, note, illustration_url, created_at")
    .order("name", { ascending: true })

  if (error) {
    throw new Error("Failed to fetch exercises")
  }

  return data as ExerciseRow[]
}

export async function getExerciseById(
  id: string,
): Promise<ExerciseRow | null> {
  await requireAdmin()

  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) {
    throw new Error("Invalid exercise ID")
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("exercises")
    .select("id, workout_id, name, sets, reps, rest, note, illustration_url, created_at")
    .eq("id", parsed.data)
    .single()

  if (error) return null

  return data as ExerciseRow
}

// --- Mutations ---

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string }

export async function uploadIllustration(
  exerciseId: string,
  formData: FormData,
): Promise<UploadResult> {
  await requireAdmin()

  const parsed = uuidSchema.safeParse(exerciseId)
  if (!parsed.success) {
    return { success: false, error: "ID de exercicio invalido." }
  }

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) {
    return { success: false, error: "Nenhum arquivo selecionado." }
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "Formato invalido. Use PNG, JPG, GIF ou WEBP." }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Arquivo muito grande. Maximo 5MB." }
  }

  const supabase = createAdminClient()

  // Remove old illustration if exists
  const { data: existing } = await supabase
    .from("exercises")
    .select("illustration_url")
    .eq("id", parsed.data)
    .single()

  if (existing?.illustration_url) {
    const oldPath = extractStoragePath(existing.illustration_url)
    if (oldPath) {
      await supabase.storage.from("exercicios-illustracoes").remove([oldPath])
    }
  }

  // Upload new file
  const ext = file.name.split(".").pop() ?? "png"
  const storagePath = `exercises/${parsed.data}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from("exercicios-illustracoes")
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return { success: false, error: "Falha no upload: " + uploadError.message }
  }

  const { data: urlData } = supabase.storage
    .from("exercicios-illustracoes")
    .getPublicUrl(storagePath)

  // Update exercise record
  const { error: updateError } = await supabase
    .from("exercises")
    .update({ illustration_url: urlData.publicUrl })
    .eq("id", parsed.data)

  if (updateError) {
    return { success: false, error: "Upload ok, mas falha ao salvar URL no banco." }
  }

  return { success: true, url: urlData.publicUrl }
}

export type DeleteResult =
  | { success: true }
  | { success: false; error: string }

export async function deleteIllustration(
  exerciseId: string,
): Promise<DeleteResult> {
  await requireAdmin()

  const parsed = uuidSchema.safeParse(exerciseId)
  if (!parsed.success) {
    return { success: false, error: "ID de exercicio invalido." }
  }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("exercises")
    .select("illustration_url")
    .eq("id", parsed.data)
    .single()

  if (existing?.illustration_url) {
    const oldPath = extractStoragePath(existing.illustration_url)
    if (oldPath) {
      await supabase.storage.from("exercicios-illustracoes").remove([oldPath])
    }
  }

  const { error } = await supabase
    .from("exercises")
    .update({ illustration_url: null })
    .eq("id", parsed.data)

  if (error) {
    return { success: false, error: "Falha ao remover ilustracao." }
  }

  return { success: true }
}

// --- Helpers ---

function extractStoragePath(url: string): string | null {
  const marker = "/storage/v1/object/public/exercicios-illustracoes/"
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}
