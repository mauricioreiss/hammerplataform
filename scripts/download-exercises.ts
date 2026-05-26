import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"

const IMAGES_DIR = join(process.cwd(), "data", "images-treino")
const BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"

// Mapping: Portuguese name -> exercise ID in free-exercise-db
// Each exercise has 0.jpg (start position) and 1.jpg (end position)
const EXERCISES: Record<string, string> = {
  "agachamento-livre": "Barbell_Squat",
  "supino-reto": "Barbell_Bench_Press_-_Medium_Grip",
  "levantamento-terra": "Barbell_Deadlift",
  "remada-curvada": "Bent_Over_Barbell_Row",
  "desenvolvimento-militar": "Standing_Military_Press",
  "rosca-direta": "Barbell_Curl",
  "triceps-pulley": "Triceps_Pushdown",
  "leg-press": "Leg_Press",
  "extensora": "Leg_Extensions",
  "flexora": "Lying_Leg_Curls",
  "puxada-frontal": "Wide-Grip_Lat_Pulldown",
  "remada-baixa": "Seated_Cable_Rows",
  "elevacao-lateral": "Side_Lateral_Raise",
  "crucifixo": "Dumbbell_Flyes",
  "rosca-alternada": "Alternate_Dumbbell_Curl",
  "panturrilha-em-pe": "Standing_Calf_Raises",
  "abdominal": "Crunches",
  "hack-squat": "Hack_Squat",
  "stiff": "Stiff-Legged_Barbell_Deadlift",
  "afundo": "Dumbbell_Lunges",
  "supino-inclinado": "Incline_Dumbbell_Press",
  "front-squat": "Front_Barbell_Squat",
  "rosca-martelo": "Hammer_Curls",
  "triceps-testa": "Lying_Triceps_Press",
  "encolhimento": "Barbell_Shrug",
}

async function downloadExercises() {
  await mkdir(IMAGES_DIR, { recursive: true })

  console.log(`Downloading ${Object.keys(EXERCISES).length} exercise images...`)
  console.log(`Saving to: ${IMAGES_DIR}`)
  console.log("")

  let successCount = 0
  let errorCount = 0

  for (const [ptName, exerciseId] of Object.entries(EXERCISES)) {
    // Download both positions (0.jpg = start, 1.jpg = end)
    for (const idx of [0, 1]) {
      const url = `${BASE_URL}/${exerciseId}/${idx}.jpg`
      const filename = `${ptName}-${idx}.jpg`
      const filepath = join(IMAGES_DIR, filename)

      try {
        const response = await fetch(url)

        if (!response.ok) {
          console.error(`  FAIL: ${filename} (${response.status})`)
          errorCount++
          continue
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        await writeFile(filepath, buffer)
        successCount++
        console.log(`  OK: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`  FAIL: ${filename} - ${message}`)
        errorCount++
      }
    }
  }

  console.log("")
  console.log(`Download complete: ${successCount} ok, ${errorCount} failed`)
  console.log("")
  console.log("Next steps:")
  console.log(
    "  1. Run: npx tsx --env-file=.env.local scripts/upload_exercises.ts",
  )
  console.log("     to upload images to Supabase Storage")
  console.log(
    "  2. Use /admin/exercicios to manage illustrations individually",
  )
}

downloadExercises()
