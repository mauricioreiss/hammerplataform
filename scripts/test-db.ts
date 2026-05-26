import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log(`Connecting to: ${supabaseUrl}`)

  const { data, error } = await supabase.from("users").select("*").limit(1)

  if (error) {
    // A "relation does not exist" error still means the connection worked
    if (error.message.includes("does not exist") || error.code === "42P01") {
      console.log("Connection OK. Table 'users' does not exist yet (expected for fresh project).")
      console.log(`  Supabase error: ${error.message}`)
      return
    }
    console.error("Connection failed:", error.message)
    process.exit(1)
  }

  console.log("Connection OK. Query returned:", data)
}

testConnection()
