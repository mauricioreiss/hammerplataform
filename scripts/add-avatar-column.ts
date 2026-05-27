import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function main() {
  const { error } = await supabase.rpc("exec_sql", {
    query: "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;",
  })

  if (error) {
    console.log("RPC nao disponivel, rode manualmente no Supabase SQL Editor:")
    console.log("")
    console.log("  ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;")
    console.log("")
  } else {
    console.log("Coluna avatar_url adicionada.")
  }
}

main().catch(console.error)
