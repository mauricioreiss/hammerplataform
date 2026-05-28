import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()

console.log("URL:", url)
console.log("Key (first 20):", key.slice(0, 20) + "...")

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // Check users table
  console.log("\n--- USERS TABLE ---")
  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select("*")

  if (usersErr) {
    console.log("ERROR:", usersErr.message)
  } else {
    console.log("Rows:", users?.length ?? 0)
    users?.forEach((u) => console.log(`  id=${u.id} role=${u.role} name=${u.full_name} email=${u.email}`))
  }

  // Check auth users
  console.log("\n--- AUTH USERS ---")
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers()

  if (authErr) {
    console.log("ERROR:", authErr.message)
  } else {
    console.log("Users:", authData.users.length)
    authData.users.forEach((u) => console.log(`  id=${u.id} email=${u.email}`))
  }

  // Check tables exist
  console.log("\n--- TABLES CHECK ---")
  for (const table of ["users", "exercises", "anamnesis", "workouts"]) {
    const { error } = await supabase.from(table).select("id").limit(1)
    console.log(`  ${table}: ${error ? "ERROR - " + error.message : "OK"}`)
  }
}

main().catch(console.error)
