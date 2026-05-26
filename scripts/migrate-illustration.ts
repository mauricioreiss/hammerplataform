import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function migrate() {
  console.log("1/2 Adding illustration_url column to exercises...")

  const { error: sqlError } = await supabase.rpc("exec_sql", {
    query:
      "ALTER TABLE exercises ADD COLUMN IF NOT EXISTS illustration_url TEXT;",
  })

  if (sqlError) {
    // If rpc doesn't exist, try raw SQL via REST
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query:
          "ALTER TABLE exercises ADD COLUMN IF NOT EXISTS illustration_url TEXT;",
      }),
    })

    if (!res.ok) {
      console.warn(
        "Could not run ALTER TABLE via RPC. Run this SQL manually in Supabase Dashboard:",
      )
      console.warn(
        "  ALTER TABLE exercises ADD COLUMN IF NOT EXISTS illustration_url TEXT;",
      )
      console.warn("")
      console.warn("Continuing with storage setup...")
    } else {
      console.log("  Column added.")
    }
  } else {
    console.log("  Column added.")
  }

  console.log("2/2 Creating storage bucket 'exercicios-illustracoes'...")

  const { error: bucketError } = await supabase.storage.createBucket(
    "exercicios-illustracoes",
    {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ],
    },
  )

  if (bucketError) {
    if (bucketError.message.includes("already exists")) {
      console.log("  Bucket already exists.")
    } else {
      console.error("  Failed to create bucket:", bucketError.message)
      process.exit(1)
    }
  } else {
    console.log("  Bucket created (public, 5MB limit, images only).")
  }

  console.log("")
  console.log("Migration complete.")
  console.log("")
  console.log("If the ALTER TABLE step failed, run this in Supabase SQL Editor:")
  console.log(
    "  ALTER TABLE exercises ADD COLUMN IF NOT EXISTS illustration_url TEXT;",
  )
}

migrate()
