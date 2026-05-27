/**
 * Migration v3: Adiciona colunas avatar_url, pix_key na tabela users
 * e icon na tabela workouts.
 *
 * Rode no Supabase SQL Editor:
 *
 * ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
 * ALTER TABLE users ADD COLUMN IF NOT EXISTS pix_key text;
 * ALTER TABLE workouts ADD COLUMN IF NOT EXISTS icon varchar(10);
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const statements = [
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS pix_key text;",
  "ALTER TABLE workouts ADD COLUMN IF NOT EXISTS icon varchar(10);",
]

async function main() {
  console.log("Migration v3: avatar_url, pix_key, icon\n")

  for (const sql of statements) {
    const { error } = await supabase.rpc("exec_sql", { query: sql })
    if (error) {
      console.log(`RPC indisponivel. Rode manualmente no Supabase SQL Editor:\n`)
      for (const s of statements) {
        console.log(`  ${s}`)
      }
      console.log("")
      return
    }
    console.log(`OK: ${sql}`)
  }

  console.log("\nMigration concluida.")
}

main().catch(console.error)
