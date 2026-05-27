import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()
const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // 1. Delete 'ombro' exercise
  const { error: delErr } = await admin
    .from("exercises")
    .delete()
    .eq("name", "ombro")
    .is("workout_id", null)
  console.log("Delete 'ombro':", delErr ? delErr.message : "OK")

  // 2. Delete ALL old library exercises to re-seed clean
  const { error: clearErr } = await admin
    .from("exercises")
    .delete()
    .is("workout_id", null)
  console.log("Clear library:", clearErr ? clearErr.message : "OK")

  // 3. Insert 30+ exercises with descriptions
  const exercises = [
    // Peito
    { name: "Supino Reto", muscle_group: "Peito", description: "Deite no banco reto, desça a barra ate o peito e empurre ate a extensao dos bracos. Mantenha escapulas retraidas.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Supino+Reto" },
    { name: "Supino Inclinado", muscle_group: "Peito", description: "Banco inclinado a 30-45 graus. Desça a barra ate a parte superior do peito. Enfatiza a porcao clavicular.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Supino+Inclinado" },
    { name: "Supino Declinado", muscle_group: "Peito", description: "Banco declinado 15-30 graus. Desça a barra ate a parte inferior do peito. Enfatiza porcao esternal.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Supino+Declinado" },
    { name: "Crucifixo com Halteres", muscle_group: "Peito", description: "Deitado no banco, abra os bracos em arco com halteres, mantendo leve flexao de cotovelo. Controle a descida.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Crucifixo" },
    { name: "Crossover", muscle_group: "Peito", description: "Em pe entre as polias, puxe os cabos para baixo e ao centro com bracos semiflexionados. Contraia o peito no final.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Crossover" },

    // Costas
    { name: "Puxada Frontal", muscle_group: "Costas", description: "Sentado na polia alta, puxe a barra ate a altura do queixo com pegada aberta. Mantenha o tronco levemente inclinado.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Puxada+Frontal" },
    { name: "Remada Curvada", muscle_group: "Costas", description: "Incline o tronco a 45 graus, puxe a barra em direcao ao abdomen. Mantenha costas retas e cotovelos proximos ao corpo.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Remada+Curvada" },
    { name: "Remada Unilateral", muscle_group: "Costas", description: "Apoie um joelho e mao no banco. Com o halter na outra mao, puxe em direcao ao quadril. Controle a descida.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Remada+Unilateral" },
    { name: "Puxada Supinada", muscle_group: "Costas", description: "Na polia alta com pegada supinada (palmas para voce), puxe ate o peito. Maior enfase no biceps e dorsal inferior.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Puxada+Supinada" },
    { name: "Remada Cavaleiro", muscle_group: "Costas", description: "Posicione-se sobre a barra T, puxe com ambas as maos em direcao ao peito. Otimo para espessura das costas.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Remada+Cavaleiro" },

    // Ombros
    { name: "Desenvolvimento Militar", muscle_group: "Ombros", description: "Sentado ou em pe, empurre a barra ou halteres acima da cabeca ate extensao total. Nao hiperextenda a lombar.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Desenvolvimento" },
    { name: "Elevacao Lateral", muscle_group: "Ombros", description: "Em pe com halteres, eleve os bracos lateralmente ate a altura dos ombros. Cotovelos levemente flexionados.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Elevacao+Lateral" },
    { name: "Elevacao Frontal", muscle_group: "Ombros", description: "Em pe, eleve os halteres a frente do corpo ate a altura dos ombros, alternando ou simultaneo.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Elevacao+Frontal" },
    { name: "Crucifixo Inverso", muscle_group: "Ombros", description: "Inclinado ou na maquina, abra os bracos para tras focando no deltoide posterior. Controle o movimento.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Crucifixo+Inverso" },

    // Biceps
    { name: "Rosca Direta", muscle_group: "Biceps", description: "Em pe com barra, flexione os cotovelos trazendo a barra ate os ombros. Nao balance o tronco.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Rosca+Direta" },
    { name: "Rosca Alternada", muscle_group: "Biceps", description: "Sentado ou em pe, flexione um braco por vez com halteres. Supine o punho durante a subida.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Rosca+Alternada" },
    { name: "Rosca Martelo", muscle_group: "Biceps", description: "Com halteres em pegada neutra (palmas voltadas para dentro), flexione os cotovelos. Trabalha braquial e braquiorradial.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Rosca+Martelo" },

    // Triceps
    { name: "Triceps Corda", muscle_group: "Triceps", description: "Na polia alta com corda, estenda os cotovelos para baixo abrindo a corda no final. Mantenha cotovelos fixos.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Triceps+Corda" },
    { name: "Triceps Testa", muscle_group: "Triceps", description: "Deitado no banco com barra ou halteres, flexione os cotovelos descendo o peso ate a testa. Estenda completamente.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Triceps+Testa" },
    { name: "Triceps Mergulho", muscle_group: "Triceps", description: "Nas paralelas, desça o corpo flexionando os cotovelos e empurre de volta. Tronco reto para enfase no triceps.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Triceps+Mergulho" },

    // Pernas
    { name: "Agachamento Livre", muscle_group: "Pernas", description: "Barra nas costas, desça ate coxas paralelas ao chao. Joelhos alinhados com os pes. Base na largura dos ombros.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Agachamento" },
    { name: "Leg Press 45", muscle_group: "Pernas", description: "Na maquina a 45 graus, empurre a plataforma estendendo os joelhos. Nao trave completamente os joelhos no topo.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Leg+Press+45" },
    { name: "Cadeira Extensora", muscle_group: "Pernas", description: "Sentado na maquina, estenda os joelhos ate a extensao completa. Controle a descida. Isola o quadriceps.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Extensora" },
    { name: "Cadeira Flexora", muscle_group: "Pernas", description: "Sentado ou deitado na maquina, flexione os joelhos trazendo o calcanhar em direcao ao gluteo. Isola posteriores.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Flexora" },
    { name: "Hack Squat", muscle_group: "Pernas", description: "Na maquina hack, agache com as costas apoiadas no encosto. Pes a frente para enfase em quadriceps.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Hack+Squat" },
    { name: "Afundo", muscle_group: "Pernas", description: "De um passo a frente e desça ate o joelho traseiro quase tocar o chao. Alterne as pernas. Trabalha gluteos e quadriceps.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Afundo" },

    // Posterior
    { name: "Levantamento Terra", muscle_group: "Posterior", description: "Com barra no chao, levante mantendo costas retas, empurrando o quadril para frente. Movimento composto completo.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Levantamento+Terra" },
    { name: "Stiff", muscle_group: "Posterior", description: "Em pe com barra ou halteres, incline o tronco mantendo pernas semiflexionadas. Sinta o alongamento dos isquiotibiais.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Stiff" },
    { name: "Mesa Flexora", muscle_group: "Posterior", description: "Deitado na maquina, flexione os joelhos contra a resistencia. Foco na contracao dos isquiotibiais.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Mesa+Flexora" },

    // Gluteos
    { name: "Hip Thrust", muscle_group: "Gluteos", description: "Costas apoiadas no banco, barra sobre o quadril. Eleve o quadril contraindo o gluteo no topo. Principal exercicio para gluteos.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Hip+Thrust" },
    { name: "Elevacao Pelvica", muscle_group: "Gluteos", description: "Deitado no chao, eleve o quadril contraindo os gluteos. Variacao: unilateral para maior intensidade.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Elevacao+Pelvica" },

    // Abdomen
    { name: "Abdominal Crunch", muscle_group: "Abdomen", description: "Deitado com joelhos flexionados, eleve os ombros do chao contraindo o abdomen. Nao puxe o pescoco.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Crunch" },
    { name: "Prancha Isometrica", muscle_group: "Abdomen", description: "Apoie-se nos antebracos e pontas dos pes, mantendo o corpo reto. Segure a posicao contraindo o core.", illustration_url: "https://placehold.co/600x400/09090b/ef4444?text=Prancha" },
  ]

  const { data, error: insErr } = await admin
    .from("exercises")
    .insert(exercises)
    .select("id, name, muscle_group")

  if (insErr) {
    console.log("Insert error:", insErr.message)
    // If description column doesn't exist, try without it
    if (insErr.message.includes("description")) {
      console.log("Retrying without description column...")
      const withoutDesc = exercises.map(({ description, ...rest }) => rest)
      const { data: d2, error: e2 } = await admin.from("exercises").insert(withoutDesc).select("id, name")
      if (e2) {
        console.error("Still failed:", e2.message)
        process.exit(1)
      }
      console.log(`Inserted ${d2.length} exercises (without description)`)
      console.log("NOTE: Run this SQL in Supabase dashboard to add description column:")
      console.log("  ALTER TABLE exercises ADD COLUMN IF NOT EXISTS description text;")
    }
  } else {
    console.log(`Inserted ${data.length} exercises with descriptions`)
  }

  // Final count
  const { data: final } = await admin
    .from("exercises")
    .select("name, muscle_group")
    .is("workout_id", null)
    .order("muscle_group")
    .order("name")

  console.log(`\nBiblioteca final: ${final?.length} exercicios`)
  const groups = new Map<string, string[]>()
  for (const ex of final ?? []) {
    const list = groups.get(ex.muscle_group) ?? []
    list.push(ex.name)
    groups.set(ex.muscle_group, list)
  }
  for (const [group, names] of groups) {
    console.log(`  ${group} (${names.length}): ${names.join(", ")}`)
  }
}

main()
