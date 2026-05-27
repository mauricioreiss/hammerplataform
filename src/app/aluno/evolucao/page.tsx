import { Scale, TrendingDown, TrendingUp } from "lucide-react"
import { getEvolucaoAluno } from "@/app/actions"

export default async function EvolucaoPage() {
  const avaliacoes = await getEvolucaoAluno()

  if (avaliacoes.length < 2) {
    return (
      <div className="py-6 space-y-6 pb-24 md:pb-6 animate-in fade-in duration-300">
        <div className="text-center pt-16">
          <Scale size={48} className="mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-500 text-sm font-bold uppercase">
            {avaliacoes.length === 0
              ? "Nenhuma avaliação registrada"
              : "Apenas 1 avaliação registrada"}
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            São necessárias pelo menos 2 avaliações para gerar o comparativo.
          </p>
        </div>
      </div>
    )
  }

  const after = avaliacoes[0]
  const before = avaliacoes[avaliacoes.length - 1]

  const pesoDiff = (before.weight ?? 0) - (after.weight ?? 0)
  const bfDiff = (before.body_fat ?? 0) - (after.body_fat ?? 0)
  const magraDiff = (after.lean_mass ?? 0) - (before.lean_mass ?? 0)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })

  return (
    <div className="py-6 space-y-6 pb-24 md:pb-6 animate-in fade-in duration-300">
      <div className="text-center mb-6 pt-2">
        <h2 className="text-3xl font-black italic text-red-600 uppercase tracking-tighter">
          Seus Resultados
        </h2>
        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">
          Comparativo de Avaliações
        </p>
      </div>

      {/* Date range */}
      <div className="flex justify-between items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800">
        <div className="text-center flex-1">
          <span className="text-[9px] text-zinc-500 font-bold uppercase">
            Início
          </span>
          <p className="text-white font-bold text-sm">{formatDate(before.date)}</p>
        </div>
        <div className="text-zinc-600">&rarr;</div>
        <div className="text-center flex-1">
          <span className="text-[9px] text-red-500 font-bold uppercase">
            Atual
          </span>
          <p className="text-white font-bold text-sm">{formatDate(after.date)}</p>
        </div>
      </div>

      {/* Photos */}
      {(before.photo_url || after.photo_url) && (
        <div>
          <h3 className="text-white font-black italic uppercase text-sm mb-3 flex items-center gap-2">
            Evolução Física
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {before.photo_url && (
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={before.photo_url}
                  alt="Antes"
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white uppercase backdrop-blur">
                  Antes
                </div>
              </div>
            )}
            {after.photo_url && (
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={after.photo_url}
                  alt="Depois"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-red-600 px-2 py-1 rounded text-[10px] font-bold text-white uppercase shadow-lg">
                  Atual
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div>
        <h3 className="text-white font-black italic uppercase text-sm mb-3 flex items-center gap-2">
          <Scale size={14} className="text-zinc-500" /> Números
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Peso */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
            <div className="w-1/3">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Peso</p>
            </div>
            <div className="w-1/3 text-center">
              <p className="text-zinc-500 text-xs line-through">
                {before.weight ?? "—"} kg
              </p>
              <p className="text-white font-black text-base">
                {after.weight ?? "—"} kg
              </p>
            </div>
            <div className="w-1/3 flex justify-end">
              <span className={`${pesoDiff > 0 ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-red-500/20 text-red-500 border-red-500/30"} border px-2 py-1 rounded flex items-center gap-1 font-bold text-[10px]`}>
                <TrendingDown size={12} /> {pesoDiff.toFixed(1)} kg
              </span>
            </div>
          </div>

          {/* Gordura */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
            <div className="w-1/3">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">% Gordura</p>
            </div>
            <div className="w-1/3 text-center">
              <p className="text-zinc-500 text-xs line-through">
                {before.body_fat ?? "—"} %
              </p>
              <p className="text-white font-black text-base">
                {after.body_fat ?? "—"} %
              </p>
            </div>
            <div className="w-1/3 flex justify-end">
              <span className={`${bfDiff > 0 ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-red-500/20 text-red-500 border-red-500/30"} border px-2 py-1 rounded flex items-center gap-1 font-bold text-[10px]`}>
                <TrendingDown size={12} /> {bfDiff.toFixed(1)} %
              </span>
            </div>
          </div>

          {/* Massa Magra */}
          <div className="flex items-center justify-between p-4">
            <div className="w-1/3">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">M. Magra</p>
            </div>
            <div className="w-1/3 text-center">
              <p className="text-zinc-500 text-xs line-through">
                {before.lean_mass ?? "—"} kg
              </p>
              <p className="text-white font-black text-base">
                {after.lean_mass ?? "—"} kg
              </p>
            </div>
            <div className="w-1/3 flex justify-end">
              <span className={`${magraDiff > 0 ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-red-500/20 text-red-500 border-red-500/30"} border px-2 py-1 rounded flex items-center gap-1 font-bold text-[10px]`}>
                <TrendingUp size={12} /> {magraDiff.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] uppercase font-bold text-zinc-500 pt-4">
        Avaliação inserida pelo treinador. Não editável.
      </p>
    </div>
  )
}
