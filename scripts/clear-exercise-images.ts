import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function main() {
  const { data, error } = await supabase
    .from("exercises")
    .update({ illustration_url: null })
    .is("workout_id", null)
    .select("id, name")

  if (error) {
    console.log("Erro:", error.message)
    return
  }

  console.log(`${data.length} exercicios limpos (illustration_url = null)`)
}

main().catch(console.error)
