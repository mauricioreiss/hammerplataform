import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()

console.log("URL:", url.slice(0, 30) + "...")
console.log("Key:", key ? "presente" : "VAZIA")

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const exercises = [
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

async function main() {
  const { data, error } = await admin
    .from("exercises")
    .insert(exercises)
    .select("id, name, muscle_group")

  if (error) {
    console.error("ERRO:", error.message)
    process.exit(1)
  }

  console.log(`\nInseridos ${data.length} exercicios:`)
  for (const e of data) {
    console.log(` - ${e.name} (${e.muscle_group})`)
  }
}

main()
