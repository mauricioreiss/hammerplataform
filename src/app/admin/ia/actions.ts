"use server"

import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { generateCompletion } from "@/lib/openai"

// --- Types ---

export type AnamneseRow = {
  id: string
  user_id: string | null
  weight: number | null
  height: number | null
  injuries: string | null
  days_per_week: number | null
  par_q_data: Record<string, boolean> | null
  created_at: string
}

export type AnamneseWithUser = AnamneseRow & {
  user_name: string | null
}

export type AnalysisResult =
  | { success: true; analysis: string }
  | { success: false; error: string }

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

export async function getAnamneses(): Promise<AnamneseWithUser[]> {
  await requireAdmin()

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("anamnesis")
    .select("id, user_id, weight, height, injuries, days_per_week, par_q_data, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Failed to fetch anamneses")
  }

  const anamneses = data as AnamneseRow[]

  // Fetch user names for anamneses that have user_id
  const userIds = anamneses
    .map((a) => a.user_id)
    .filter((id): id is string => id !== null)

  let userMap: Record<string, string> = {}

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name")
      .in("id", userIds)

    if (users) {
      userMap = Object.fromEntries(users.map((u) => [u.id, u.full_name]))
    }
  }

  return anamneses.map((a) => ({
    ...a,
    user_name: a.user_id ? userMap[a.user_id] ?? null : null,
  }))
}

export async function getAnamneseById(
  id: string,
): Promise<AnamneseWithUser | null> {
  await requireAdmin()

  const parsed = z.string().uuid().safeParse(id)
  if (!parsed.success) return null

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("anamnesis")
    .select("id, user_id, weight, height, injuries, days_per_week, par_q_data, created_at")
    .eq("id", parsed.data)
    .single()

  if (error || !data) return null

  const anamnese = data as AnamneseRow

  let userName: string | null = null
  if (anamnese.user_id) {
    const { data: user } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", anamnese.user_id)
      .single()
    userName = user?.full_name ?? null
  }

  return { ...anamnese, user_name: userName }
}

// --- AI Analysis ---

const PAR_Q_LABELS = [
  "Problema cardíaco diagnosticado",
  "Dor no peito durante atividade física",
  "Problema ósseo, articular ou muscular",
  "Medicamentos para pressão/coração",
  "Diabetes, hipertensão ou colesterol elevado",
]

function buildPrompt(anamnese: AnamneseRow): string {
  const parqFormatted = anamnese.par_q_data
    ? Object.entries(anamnese.par_q_data)
        .map(([key, value]) => {
          const label = PAR_Q_LABELS[Number(key)] ?? `Pergunta ${key}`
          return `  - ${label}: ${value ? "SIM" : "NÃO"}`
        })
        .join("\n")
    : "  Não informado"

  return `Você é o assistente técnico de um Personal Trainer de elite, Felipe Hammer. Sua função não é gerar a ficha pronta, mas analisar a anamnese do aluno e sugerir uma estratégia de treino baseada na metodologia do Felipe.

Dados do aluno:
- Peso: ${anamnese.weight ?? "Não informado"}kg
- Altura: ${anamnese.height ?? "Não informado"}cm
- Lesões/Histórico: ${anamnese.injuries || "Nenhuma relatada"}
- Dias de treino por semana: ${anamnese.days_per_week ?? "Não informado"}
- Respostas PAR-Q:
${parqFormatted}

Forneça:

1. **ANÁLISE DE RISCO**: Baseada no PAR-Q. Identifique restrições e bandeiras vermelhas. Se todas as respostas forem "NÃO", informe que o aluno está liberado sem restrições.

2. **SUGESTÃO DE ESTRATÉGIA**: Tipo de periodização, volume, frequência e foco recomendado para o perfil do aluno. Justifique com base nos dados.

3. **IDEIAS DE EXERCÍCIOS**: Sugira 3-4 exercícios que se encaixam no perfil, explicando por que cada um foi escolhido.

Seja direto e técnico. Use linguagem de profissional de educação física. Formate com markdown.`
}

export async function analyzeAnamnese(id: string): Promise<AnalysisResult> {
  await requireAdmin()

  const parsed = z.string().uuid().safeParse(id)
  if (!parsed.success) {
    return { success: false, error: "ID inválido" }
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("anamnesis")
    .select("id, user_id, weight, height, injuries, days_per_week, par_q_data, created_at")
    .eq("id", parsed.data)
    .single()

  if (error || !data) {
    return { success: false, error: "Anamnese não encontrada" }
  }

  const prompt = buildPrompt(data as AnamneseRow)

  try {
    const analysis = await generateCompletion(prompt)
    return { success: true, analysis }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao gerar análise"

    if (message.includes("OPENAI_API_KEY")) {
      return {
        success: false,
        error:
          "Chave da OpenAI não configurada. Adicione OPENAI_API_KEY no .env.local",
      }
    }

    return { success: false, error: message }
  }
}
