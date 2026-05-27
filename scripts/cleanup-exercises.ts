import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()
const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // 1. Get all library exercises (workout_id IS NULL)
  const { data: all, error } = await admin
    .from("exercises")
    .select("id, name, muscle_group, illustration_url, workout_id")
    .is("workout_id", null)
    .order("name")

  if (error) {
    console.error("Erro ao buscar:", error.message)
    process.exit(1)
  }

  console.log(`Total de exercicios na biblioteca: ${all.length}\n`)

  // 2. Group by name
  const groups = new Map<string, typeof all>()
  for (const ex of all) {
    const list = groups.get(ex.name) ?? []
    list.push(ex)
    groups.set(ex.name, list)
  }

  // 3. For each group, keep the one with illustration_url (or first), delete rest
  let deleted = 0
  for (const [name, items] of groups) {
    if (items.length <= 1) continue

    // Prefer the one with an illustration
    const keep = items.find((i) => i.illustration_url) ?? items[0]
    const toDelete = items.filter((i) => i.id !== keep.id).map((i) => i.id)

    console.log(`${name}: ${items.length} duplicatas, mantendo ${keep.id}, deletando ${toDelete.length}`)

    const { error: delErr } = await admin
      .from("exercises")
      .delete()
      .in("id", toDelete)

    if (delErr) {
      console.error(`  ERRO ao deletar: ${delErr.message}`)
    } else {
      deleted += toDelete.length
    }
  }

  console.log(`\nDeletados: ${deleted} duplicatas`)

  // 4. Fix wrong images
  const fixes: Record<string, string> = {
    // Leg Press 45 tinha imagem de foam roller
    "Leg Press 45": "https://wger.de/media/exercise-images/199/Narrow-stance-squat-1.png",
  }

  for (const [name, newUrl] of Object.entries(fixes)) {
    const { error: fixErr } = await admin
      .from("exercises")
      .update({ illustration_url: newUrl })
      .eq("name", name)
      .is("workout_id", null)

    if (fixErr) {
      console.error(`Erro ao corrigir ${name}: ${fixErr.message}`)
    } else {
      console.log(`Imagem corrigida: ${name}`)
    }
  }

  // 5. Show final state
  const { data: final } = await admin
    .from("exercises")
    .select("name, muscle_group, illustration_url")
    .is("workout_id", null)
    .order("name")

  console.log(`\nBiblioteca final (${final?.length ?? 0} exercicios):`)
  for (const ex of final ?? []) {
    const hasImg = ex.illustration_url ? "com imagem" : "SEM IMAGEM"
    console.log(`  - ${ex.name} (${ex.muscle_group}) [${hasImg}]`)
  }
}

main()
