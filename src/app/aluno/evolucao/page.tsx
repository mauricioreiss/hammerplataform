import { Camera, Scale, TrendingDown, TrendingUp } from "lucide-react"
import { studentAvaliacao } from "@/lib/mock-data"

export default function EvolucaoPage() {
  const av = studentAvaliacao

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 animate-in fade-in duration-300">
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
          <p className="text-white font-bold text-sm">{av.dataAntiga}</p>
        </div>
        <div className="text-zinc-600">&rarr;</div>
        <div className="text-center flex-1">
          <span className="text-[9px] text-red-500 font-bold uppercase">
            Atual
          </span>
          <p className="text-white font-bold text-sm">{av.dataNova}</p>
        </div>
      </div>

      {/* Photos */}
      <div>
        <h3 className="text-white font-black italic uppercase text-sm mb-3 flex items-center gap-2">
          <Camera size={14} className="text-zinc-500" /> Evolução Física
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={av.fotoAntes}
              alt="Antes"
              className="w-full h-full object-cover grayscale"
            />
            <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white uppercase backdrop-blur">
              Antes
            </div>
          </div>
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={av.fotoDepois}
              alt="Depois"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-red-600 px-2 py-1 rounded text-[10px] font-bold text-white uppercase shadow-lg">
              Atual
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h3 className="text-white font-black italic uppercase text-sm mb-3 flex items-center gap-2">
          <Scale size={14} className="text-zinc-500" /> Números
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Peso */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
            <div className="w-1/3">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">
                Peso
              </p>
            </div>
            <div className="w-1/3 text-center">
              <p className="text-zinc-500 text-xs line-through">
                {av.pesoAntigo} kg
              </p>
              <p className="text-white font-black text-base">
                {av.pesoNovo} kg
              </p>
            </div>
            <div className="w-1/3 flex justify-end">
              <span className="bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-1 rounded flex items-center gap-1 font-bold text-[10px]">
                <TrendingDown size={12} /> {av.diffPeso} kg
              </span>
            </div>
          </div>

          {/* Gordura */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
            <div className="w-1/3">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">
                % Gordura
              </p>
            </div>
            <div className="w-1/3 text-center">
              <p className="text-zinc-500 text-xs line-through">
                {av.bfAntigo} %
              </p>
              <p className="text-white font-black text-base">
                {av.bfNovo} %
              </p>
            </div>
            <div className="w-1/3 flex justify-end">
              <span className="bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-1 rounded flex items-center gap-1 font-bold text-[10px]">
                <TrendingDown size={12} /> {av.diffBf} %
              </span>
            </div>
          </div>

          {/* Massa Magra */}
          <div className="flex items-center justify-between p-4">
            <div className="w-1/3">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">
                M. Magra
              </p>
            </div>
            <div className="w-1/3 text-center">
              <p className="text-zinc-500 text-xs line-through">
                {av.massaAntiga} kg
              </p>
              <p className="text-white font-black text-base">
                {av.massaNova} kg
              </p>
            </div>
            <div className="w-1/3 flex justify-end">
              <span className="bg-green-500/20 text-green-500 border border-green-500/30 px-2 py-1 rounded flex items-center gap-1 font-bold text-[10px]">
                <TrendingUp size={12} /> {av.diffMassa} kg
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
