import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getOpenAIClient } from "@/lib/openai"

export async function POST(request: Request) {
  try {
    // Auth check - only admins can generate
    const supabase = await createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ success: false, error: "Nao autenticado." }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: profile } = await admin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ success: false, error: "Sem permissao." }, { status: 403 })
    }

    // Parse body
    const body = await request.json()
    const userId = body.userId as string
    if (!userId) {
      return NextResponse.json({ success: false, error: "userId obrigatorio." }, { status: 400 })
    }

    // Fetch student data
    const { data: student } = await admin
      .from("users")
      .select("full_name, objective")
      .eq("id", userId)
      .single()

    if (!student) {
      return NextResponse.json({ success: false, error: "Aluno nao encontrado." }, { status: 404 })
    }

    // Fetch anamnesis
    const { data: anamnese } = await admin
      .from("anamnesis")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    // Fetch library exercises for reference
    const { data: libraryExercises } = await admin
      .from("exercises")
      .select("name, muscle_group")
      .is("workout_id", null)
      .order("name")

    const exerciseList = (libraryExercises ?? [])
      .map((e) => `${e.name} (${e.muscle_group})`)
      .join(", ")

    // Build prompt
    const anamneseInfo = anamnese
      ? `Peso: ${anamnese.weight ?? "N/I"}kg, Altura: ${anamnese.height ?? "N/I"}cm, Lesoes: ${anamnese.injuries ?? "Nenhuma"}, Dias por semana: ${anamnese.days_per_week ?? "N/I"}`
      : "Sem dados de anamnese disponivel."

    const systemPrompt = `Voce e um assistente tecnico de personal trainer. Seu trabalho e gerar fichas de treino personalizadas com base nos dados do aluno.

REGRAS:
- Use APENAS exercicios da lista fornecida. Nao invente exercicios.
- Distribua os exercicios de forma equilibrada entre os grupos musculares.
- Considere lesoes e restricoes do aluno.
- Cada exercicio deve ter sets (series), reps (repeticoes) e rest (descanso em segundos).
- Gere entre 6 e 10 exercicios por ficha.
- Responda APENAS com JSON valido, sem markdown, sem texto extra.

FORMATO DE RESPOSTA (JSON):
{
  "title": "Nome da ficha",
  "exercises": [
    {
      "name": "Nome exato do exercicio da lista",
      "muscleGroup": "Grupo muscular",
      "sets": "3",
      "reps": "12",
      "rest": "60",
      "note": "Observacao opcional"
    }
  ]
}`

    const userPrompt = `Aluno: ${student.full_name}
Objetivo: ${student.objective ?? "Nao informado"}
Dados de anamnese: ${anamneseInfo}

Exercicios disponiveis na biblioteca:
${exerciseList}

Gere uma ficha de treino personalizada para este aluno.`

    // Call OpenAI
    const openai = getOpenAIClient()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const raw = completion.choices[0]?.message?.content ?? ""

    // Parse JSON response - strip markdown fences if present
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()

    let parsed: { title: string; exercises: Array<{ name: string; muscleGroup: string; sets: string; reps: string; rest: string; note?: string }> }
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({
        success: false,
        error: "IA retornou resposta invalida. Tente novamente.",
      }, { status: 500 })
    }

    if (!parsed.title || !Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
      return NextResponse.json({
        success: false,
        error: "IA retornou ficha vazia. Tente novamente.",
      }, { status: 500 })
    }

    // Match exercises to library for illustration_url
    const libraryMap = new Map(
      (libraryExercises ?? []).map((e) => [e.name.toLowerCase(), e])
    )

    // Create workout
    const { data: workout, error: wErr } = await admin
      .from("workouts")
      .insert({
        user_id: userId,
        title: parsed.title,
        is_ai_draft: true,
        status: "draft",
      })
      .select("id")
      .single()

    if (wErr || !workout) {
      return NextResponse.json({
        success: false,
        error: "Falha ao salvar ficha no banco.",
      }, { status: 500 })
    }

    // Insert exercises
    const rows = parsed.exercises.map((ex) => {
      const lib = libraryMap.get(ex.name.toLowerCase())
      return {
        workout_id: workout.id,
        name: ex.name,
        muscle_group: ex.muscleGroup,
        sets: ex.sets,
        reps: ex.reps,
        rest: ex.rest,
        note: ex.note || null,
        illustration_url: lib
          ? `https://placehold.co/600x400/09090b/ef4444?text=${encodeURIComponent(lib.name)}`
          : null,
      }
    })

    const { error: exErr } = await admin.from("exercises").insert(rows)

    if (exErr) {
      // Workout was created but exercises failed - clean up
      await admin.from("workouts").delete().eq("id", workout.id)
      return NextResponse.json({
        success: false,
        error: "Falha ao salvar exercicios.",
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, workoutId: workout.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno."

    // Specific error for missing API key
    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json({
        success: false,
        error: "Chave da OpenAI nao configurada. Adicione OPENAI_API_KEY no .env",
      }, { status: 500 })
    }

    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
