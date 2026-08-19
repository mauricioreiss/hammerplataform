"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// --- Types ---

export type ExerciseRow = {
  id: string;
  workout_id: string | null;
  name: string;
  muscle_group: string | null;
  sets: string | null;
  reps: string | null;
  rest: string | null;
  note: string | null;
  illustration_url: string | null;
};

// --- Validation ---

const uuidSchema = z.string().uuid("ID must be a valid UUID");

// --- Auth ---

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  // Use admin client to bypass RLS on users table
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return user;
}

// --- Queries ---

export async function getExercises(): Promise<ExerciseRow[]> {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("exercises")
      .select(
        "id, workout_id, name, muscle_group, sets, reps, rest, note, illustration_url",
      )
      .is("workout_id", null)
      .order("name", { ascending: true });

    if (error || !data) return [];

    return data as ExerciseRow[];
  } catch {
    return [];
  }
}

export async function getExerciseById(id: string): Promise<ExerciseRow | null> {
  try {
    await requireAdmin();

    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) return null;

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("exercises")
      .select(
        "id, workout_id, name, muscle_group, sets, reps, rest, note, illustration_url",
      )
      .eq("id", parsed.data)
      .single();

    if (error || !data) return null;

    return data as ExerciseRow;
  } catch {
    return null;
  }
}

// --- Mutations ---

export type UploadResult =
  { success: true } | { success: false; error: string };

export async function updateIllustrationUrl(
  exerciseId: string,
  url: string,
): Promise<UploadResult> {
  try {
    await requireAdmin();

    const parsed = uuidSchema.safeParse(exerciseId);
    if (!parsed.success) {
      return { success: false, error: "ID de exercicio invalido." };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("exercises")
      .update({ illustration_url: url })
      .eq("id", parsed.data);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch {
    return { success: false, error: "Erro de conexao." };
  }
}

export type DeleteResult =
  { success: true } | { success: false; error: string };

export async function deleteIllustration(
  exerciseId: string,
): Promise<DeleteResult> {
  try {
    await requireAdmin();

    const parsed = uuidSchema.safeParse(exerciseId);
    if (!parsed.success) {
      return { success: false, error: "ID de exercicio invalido." };
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("exercises")
      .select("illustration_url")
      .eq("id", parsed.data)
      .single();

    if (existing?.illustration_url) {
      const oldPath = extractStoragePath(existing.illustration_url);
      if (oldPath) {
        await supabase.storage
          .from("exercicios-illustracoes")
          .remove([oldPath]);
      }
    }

    const { error } = await supabase
      .from("exercises")
      .update({ illustration_url: null })
      .eq("id", parsed.data);

    if (error) {
      return { success: false, error: "Falha ao remover ilustracao." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
}

// --- Helpers ---

function extractStoragePath(url: string): string | null {
  const marker = "/storage/v1/object/public/exercicios-illustracoes/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
