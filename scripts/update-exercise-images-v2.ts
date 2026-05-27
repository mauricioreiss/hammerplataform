import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"
const PLACEHOLDER = (name: string) =>
  `https://placehold.co/600x400/09090b/ef4444?text=${encodeURIComponent(name)}`

// Map: exercise name in PT-BR -> image path from free-exercise-db
const IMAGE_MAP: Record<string, string> = {
  "Supino Reto": `${BASE}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`,
  "Supino Inclinado": `${BASE}/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg`,
  "Supino Declinado": PLACEHOLDER("Supino Declinado"),
  "Crucifixo com Halteres": PLACEHOLDER("Crucifixo"),
  "Crossover": PLACEHOLDER("Crossover"),
  "Puxada Frontal": `${BASE}/Band_Assisted_Pull-Up/0.jpg`,
  "Remada Curvada": `${BASE}/Bent_Over_Barbell_Row/0.jpg`,
  "Remada Unilateral": `${BASE}/Bent_Over_One-Arm_Long_Bar_Row/0.jpg`,
  "Puxada Supinada": PLACEHOLDER("Puxada Supinada"),
  "Remada Cavaleiro": PLACEHOLDER("Remada Cavaleiro"),
  "Desenvolvimento Militar": `${BASE}/Barbell_Shoulder_Press/0.jpg`,
  "Elevacao Lateral": `${BASE}/Alternating_Deltoid_Raise/0.jpg`,
  "Elevacao Frontal": PLACEHOLDER("Elevacao Frontal"),
  "Crucifixo Inverso": `${BASE}/Back_Flyes_-_With_Bands/0.jpg`,
  "Rosca Direta": `${BASE}/Barbell_Curl/0.jpg`,
  "Rosca Alternada": `${BASE}/Alternate_Hammer_Curl/0.jpg`,
  "Rosca Martelo": `${BASE}/Alternate_Hammer_Curl/0.jpg`,
  "Triceps Corda": PLACEHOLDER("Triceps Corda"),
  "Triceps Testa": `${BASE}/Band_Skull_Crusher/0.jpg`,
  "Triceps Mergulho": `${BASE}/Bench_Dips/0.jpg`,
  "Agachamento Livre": `${BASE}/Barbell_Squat/0.jpg`,
  "Leg Press 45": PLACEHOLDER("Leg Press 45"),
  "Cadeira Extensora": PLACEHOLDER("Extensora"),
  "Cadeira Flexora": `${BASE}/Ball_Leg_Curl/0.jpg`,
  "Hack Squat": `${BASE}/Barbell_Hack_Squat/0.jpg`,
  "Afundo": `${BASE}/Barbell_Lunge/0.jpg`,
  "Levantamento Terra": `${BASE}/Barbell_Deadlift/0.jpg`,
  "Stiff": PLACEHOLDER("Stiff"),
  "Mesa Flexora": `${BASE}/Ball_Leg_Curl/0.jpg`,
  "Hip Thrust": `${BASE}/Barbell_Hip_Thrust/0.jpg`,
  "Elevacao Pelvica": `${BASE}/Barbell_Glute_Bridge/0.jpg`,
  "Abdominal Crunch": `${BASE}/Ab_Crunch_Machine/0.jpg`,
  "Prancha Isometrica": PLACEHOLDER("Prancha"),
}

async function main() {
  console.log("Atualizando imagens dos exercicios...\n")

  let updated = 0
  let kept = 0

  for (const [name, url] of Object.entries(IMAGE_MAP)) {
    const { data, error } = await supabase
      .from("exercises")
      .update({ illustration_url: url })
      .eq("name", name)
      .is("workout_id", null)
      .select("id")

    if (error) {
      console.log(`  ERRO: ${name} - ${error.message}`)
    } else if (data && data.length > 0) {
      const isReal = !url.includes("placehold.co")
      console.log(`  ${isReal ? "✓" : "~"} ${name} ${isReal ? "(imagem real)" : "(placeholder)"}`)
      if (isReal) updated++
      else kept++
    } else {
      console.log(`  - ${name} (nao encontrado no banco)`)
    }
  }

  console.log(`\nResultado: ${updated} com imagem real, ${kept} mantidos com placeholder`)
}

main().catch(console.error)
