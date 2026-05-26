import Link from "next/link"
import { BrainCircuit, ChevronRight, User, Calendar } from "lucide-react"
import { getAnamneses } from "./actions"

export default async function IAMakerPage() {
  const anamneses = await getAnamneses()

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in pb-24">
      <div className="flex items-center gap-2 mb-2">
        <BrainCircuit size={20} className="text-red-600" />
        <h2 className="text-lg font-black italic text-white uppercase tracking-tight">
          IA Maker
        </h2>
      </div>
      <p className="text-zinc-400 text-xs">
        Selecione uma anamnese para gerar a análise técnica com IA.
      </p>

      {anamneses.length === 0 && (
        <div className="text-center pt-16">
          <BrainCircuit size={48} className="mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-500 text-sm font-bold uppercase">
            Nenhuma anamnese recebida
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            As anamneses aparecerão aqui quando alunos preencherem o
            formulário.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {anamneses.map((anamnese) => (
          <Link
            key={anamnese.id}
            href={`/admin/ia/${anamnese.id}`}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between active:scale-95 transition-transform block hover:border-zinc-700"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                <User size={18} className="text-zinc-400" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">
                  {anamnese.user_name ?? "Aluno sem cadastro"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {anamnese.weight && (
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase">
                      {anamnese.weight}kg
                    </span>
                  )}
                  {anamnese.days_per_week && (
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-bold uppercase">
                      {anamnese.days_per_week}x/sem
                    </span>
                  )}
                  <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(anamnese.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-zinc-600 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
