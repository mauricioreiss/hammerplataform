import OpenAI from "openai";
import { z } from "zod";

const apiKey = process.env.OPENAI_API_KEY;

export function getOpenAIClient(): OpenAI {
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    throw new Error("OPENAI_API_KEY not configured");
  }
  return new OpenAI({ apiKey });
}

export async function generateCompletion(prompt: string): Promise<string> {
  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content ?? "";
}

// --- Workout Copilot ---

export type WorkoutDraftExercise = {
  name: string;
  muscleGroup: string;
  sets: string;
  reps: string;
  rest: string;
  note: string;
};

export type WorkoutDraft = {
  workoutName: string; // "A", "B", "C"...
  focus: string;
  exercises: WorkoutDraftExercise[];
};

export type WorkoutDraftResult = {
  aiNotes: string;
  workouts: WorkoutDraft[];
};

export type WorkoutDraftInput = {
  studentName: string;
  objective: string | null;
  weight: number | null;
  height: number | null;
  injuries: string | null;
  daysPerWeek: number;
  age: number | null;
  parQ: string; // restricoes do PAR-Q ja formatadas ("" se nenhuma)
  libraryExercises: string[]; // "Nome (Grupo muscular)"
};

// Build "A", "B", ... "G" for the requested number of training days.
function splitLetters(days: number): string[] {
  const clamped = Math.min(Math.max(days, 1), 7);
  return Array.from({ length: clamped }, (_, i) => String.fromCharCode(65 + i));
}

// The model returns json_object (not strict schema), so we validate + coerce
// the shape ourselves before trusting it.
const draftSchema = z.object({
  ai_notes: z.string().default(""),
  workouts: z
    .array(
      z.object({
        name: z.string(),
        focus: z.string().optional().default(""),
        exercises: z
          .array(
            z.object({
              name: z.string(),
              // model may send muscleGroup, sets, reps, rest in mixed types
              muscleGroup: z.string().optional().default("Geral"),
              sets: z.coerce.string().optional().default("3"),
              reps: z.coerce.string().optional().default("12"),
              rest: z.coerce.string().optional().default("60"),
              note: z.string().optional().default(""),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

// Generates a training split (A/B/C...) plus a clinical justification (ai_notes)
// from the student's anamnesis. Does NOT persist anything.
export async function generateWorkoutDraft(
  input: WorkoutDraftInput,
): Promise<WorkoutDraftResult> {
  const client = getOpenAIClient();
  const letters = splitLetters(input.daysPerWeek);

  const systemPrompt = `Voce e um Personal Trainer senior. Sua saida DEVE ser estritamente um objeto JSON com a seguinte estrutura: { "ai_notes": "sua justificativa clinica aqui", "workouts": [ { "name": "A", "focus": "Peito e Triceps", "exercises": [ { "name": "Supino", "muscleGroup": "Peito", "sets": 3, "reps": "10-12", "rest": "60", "note": "" } ] } ] }.

REGRAS:
- Gere EXATAMENTE ${letters.length} fichas, nomeadas ${letters.join(", ")} (campo name).
- Cada exercicio tem name, muscleGroup, sets, reps, rest (descanso em segundos) e note (use "" se vazio).
- Distribua os grupos musculares de forma equilibrada ao longo da semana, 5 a 8 exercicios por ficha.
- Priorize exercicios da biblioteca fornecida quando fizer sentido.
- Se o aluno relatar dor em uma articulacao, substitua imediatamente pesos livres por maquinas na regiao afetada e justifique isso no ai_notes.
- Atencao aos dados do PAR-Q e a Idade. Se o PAR-Q indicar qualquer risco cardiaco, tontura ou limitacao ossea/articular grave, adapte o treino para intensidade leve a moderada e adicione OBRIGATORIAMENTE um aviso no campo ai_notes alertando o Head Coach sobre o risco relatado no PAR-Q.
- O campo ai_notes deve ser um texto direto, tecnico, sem emojis e sem linguagem informal. Nao use emojis em nenhum campo.`;

  // Injeta os dados reais da anamnese num template explicito. Usa || para que
  // campo vazio (null ou "") caia no fallback e a IA tenha contexto sem ambiguidade.
  const injuries = input.injuries?.trim() || "Nenhuma relatada";
  const objective = input.objective?.trim() || "Nao especificado";

  const userPrompt = `Por favor, monte o treino para o seguinte perfil:

Aluno: ${input.studentName}
Idade do Aluno: ${input.age ?? "nao informada"} anos
Peso: ${input.weight ?? "nao informado"} kg
Altura: ${input.height ?? "nao informada"} cm
Frequencia na semana: ${input.daysPerWeek} dias
Historico de Lesoes/Dores: ${injuries}
Respostas do PAR-Q (Risco Cardiaco/Fisico): ${input.parQ || "Nenhuma restricao assinalada"}
Objetivo Principal: ${objective}

Biblioteca de exercicios disponivel (priorize estes):
${input.libraryExercises.join(", ") || "Sem biblioteca cadastrada."}`;

  console.log("--- ENVIANDO PARA IA ---", userPrompt);

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = draftSchema.parse(JSON.parse(raw));

  return {
    aiNotes: parsed.ai_notes,
    workouts: parsed.workouts.map((w) => ({
      workoutName: w.name,
      focus: w.focus,
      exercises: w.exercises,
    })),
  };
}
