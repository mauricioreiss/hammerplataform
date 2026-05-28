import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()
const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Images from wger.de (open source exercise database)
const imageMap: Record<string, string> = {
  "Supino Reto": "https://wger.de/media/exercise-images/192/Bench-press-1.png",
  "Supino Inclinado": "https://wger.de/media/exercise-images/41/Incline-bench-press-1.png",
  "Agachamento Livre": "https://wger.de/media/exercise-images/191/Front-squat-1-857x1024.png",
  "Leg Press 45": "https://wger.de/media/exercise-images/1363/1dba566b-e799-4bde-abb0-c011a3c75e52.webp",
  "Puxada Frontal": "https://wger.de/media/exercise-images/1635/b8c34e3a-7474-41ea-99e3-8d7fdb1e12d6.png",
  "Remada Curvada": "https://wger.de/media/exercise-images/110/Reverse-grip-bent-over-rows-1.png",
  "Desenvolvimento Militar": "https://wger.de/media/exercise-images/119/seated-barbell-shoulder-press-large-1.png",
  "Rosca Direta": "https://wger.de/media/exercise-images/129/Standing-biceps-curl-1.png",
  "Triceps Corda": "https://wger.de/media/exercise-images/84/Lying-close-grip-triceps-press-to-chin-1.png",
  "Levantamento Terra": "https://wger.de/media/exercise-images/161/Dead-lifts-2.png",
}

async function main() {
  for (const [name, imageUrl] of Object.entries(imageMap)) {
    const { error } = await admin
      .from("exercises")
      .update({ illustration_url: imageUrl })
      .eq("name", name)

    if (error) {
      console.error(`ERRO em ${name}:`, error.message)
    } else {
      console.log(`OK: ${name}`)
    }
  }
  console.log("\nTodas as imagens atualizadas.")
}

main()
