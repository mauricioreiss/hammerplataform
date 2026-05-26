import { createClient } from "@supabase/supabase-js"
import { readdir, readFile, writeFile } from "node:fs/promises"
import { join, extname, basename } from "node:path"

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

const BUCKET = "exercicios-illustracoes"
const IMAGES_DIR = join(process.cwd(), "data", "images-treino")
const OUTPUT_FILE = join(process.cwd(), "data", "exercise-mapping.json")

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"])

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
}

async function uploadExercises() {
  console.log(`Reading images from: ${IMAGES_DIR}`)
  console.log("")

  let files: string[]
  try {
    files = await readdir(IMAGES_DIR)
  } catch {
    console.error(`Directory not found: ${IMAGES_DIR}`)
    console.error("Create the directory and add exercise images first.")
    process.exit(1)
  }

  const imageFiles = files.filter((f) => {
    const ext = extname(f).toLowerCase()
    return ALLOWED_EXTENSIONS.has(ext) && !f.startsWith(".")
  })

  if (imageFiles.length === 0) {
    console.log("No image files found in data/images-treino/")
    console.log("Supported formats: PNG, JPG, GIF, WEBP")
    process.exit(0)
  }

  console.log(`Found ${imageFiles.length} image(s). Uploading...`)
  console.log("")

  const mapping: Record<string, string> = {}
  let successCount = 0
  let errorCount = 0

  for (const file of imageFiles) {
    const filePath = join(IMAGES_DIR, file)
    const ext = extname(file).toLowerCase()
    const name = basename(file, ext)
    const storagePath = `exercises/${Date.now()}-${file}`

    try {
      const fileBuffer = await readFile(filePath)
      const contentType = MIME_MAP[ext] ?? "application/octet-stream"

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType,
          upsert: false,
        })

      if (uploadError) {
        console.error(`  FAIL: ${file} - ${uploadError.message}`)
        errorCount++
        continue
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath)

      mapping[name] = urlData.publicUrl
      successCount++
      console.log(`  OK: ${file} -> ${urlData.publicUrl}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`  FAIL: ${file} - ${message}`)
      errorCount++
    }
  }

  console.log("")
  console.log(`Upload complete: ${successCount} ok, ${errorCount} failed`)

  if (successCount > 0) {
    await writeFile(OUTPUT_FILE, JSON.stringify(mapping, null, 2), "utf-8")
    console.log(`Mapping saved to: ${OUTPUT_FILE}`)
    console.log("")
    console.log("To update exercises in the database, use the mapping file")
    console.log(
      "or go to /admin/exercicios and upload illustrations manually.",
    )
  }
}

uploadExercises()
