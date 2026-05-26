import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ADMIN_EMAIL = "faugusto49@gmail.com"
const ADMIN_PASSWORD = "Vilamatao2"
const ADMIN_NAME = "Felipe"

async function seedAdmin() {
  console.log("Creating admin user...")

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    })

  if (authError) {
    if (authError.message.includes("already been registered")) {
      console.log("Auth user already exists, syncing users table...")

      const { data: listData } = await supabase.auth.admin.listUsers()
      const existing = listData?.users.find((u) => u.email === ADMIN_EMAIL)

      if (!existing) {
        console.error("User exists in auth but could not be found.")
        process.exit(1)
      }

      const { error: upsertError } = await supabase.from("users").upsert({
        id: existing.id,
        role: "admin",
        full_name: ADMIN_NAME,
      })

      if (upsertError) {
        console.error("Failed to upsert users row:", upsertError.message)
        process.exit(1)
      }

      console.log("Admin synced.")
      console.log(`  ID: ${existing.id}`)
      console.log(`  Email: ${ADMIN_EMAIL}`)
      return
    }

    console.error("Failed to create auth user:", authError.message)
    process.exit(1)
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: authData.user.id,
    role: "admin",
    full_name: ADMIN_NAME,
  })

  if (insertError) {
    console.error(
      "Auth user created but failed to insert into users table:",
      insertError.message,
    )
    console.error("Auth user ID:", authData.user.id)
    process.exit(1)
  }

  console.log("Admin user created.")
  console.log(`  ID: ${authData.user.id}`)
  console.log(`  Email: ${ADMIN_EMAIL}`)
  console.log(`  Name: ${ADMIN_NAME}`)
}

seedAdmin()
