import { Calendar } from "lucide-react"
import type { Evaluation } from "@/lib/types"

type AvaliacaoCardProps = {
  avaliacao: Evaluation
  isLatest: boolean
}

export function AvaliacaoCard({ avaliacao, isLatest }: AvaliacaoCardProps) {
  const dateLabel = new Date(avaliacao.date).toLocaleDateString("pt-BR")

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl relative overflow-hidden">
      {isLatest && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg">
          Mais Recente
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-zinc-500" />
          <span className="text-white font-bold">{dateLabel}</span>
        </div>
        <span className="text-zinc-500 text-[10px] font-bold uppercase border border-zinc-700 px-2 py-1 rounded">
          Método: Dobras
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 border-t border-zinc-800 pt-3">
        <div className="text-center">
          <span className="block text-[9px] uppercase text-zinc-500 font-bold mb-1">
            Peso
          </span>
          <span className="text-white font-bold">
            {avaliacao.weight ?? "—"}{" "}
            <span className="text-[10px] text-zinc-600">kg</span>
          </span>
        </div>
        <div className="text-center">
          <span className="block text-[9px] uppercase text-zinc-500 font-bold mb-1">
            Gordura
          </span>
          <span className="text-white font-bold">
            {avaliacao.body_fat ?? "—"}{" "}
            <span className="text-[10px] text-zinc-600">%</span>
          </span>
        </div>
        <div className="text-center">
          <span className="block text-[9px] uppercase text-zinc-500 font-bold mb-1">
            M. Magra
          </span>
          <span className="text-white font-bold">
            {avaliacao.lean_mass ?? "—"}{" "}
            <span className="text-[10px] text-zinc-600">kg</span>
          </span>
        </div>
        <div className="text-center">
          <span className="block text-[9px] uppercase text-zinc-500 font-bold mb-1">
            Cintura
          </span>
          <span className="text-white font-bold">
            {avaliacao.waist ?? "—"}{" "}
            <span className="text-[10px] text-zinc-600">cm</span>
          </span>
        </div>
      </div>
    </div>
  )
}
