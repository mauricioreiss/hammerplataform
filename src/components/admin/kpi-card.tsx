import { DollarSign } from "lucide-react";

type KpiCardProps = {
  mrr: string;
  active: number;
  newToday: number;
};

export function KpiCard({ mrr, active, newToday }: KpiCardProps) {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl" />
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
        <DollarSign size={14} /> Faturamento (MRR)
      </p>
      <h2 className="text-3xl font-black text-white">{mrr}</h2>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800">
        <div>
          <p className="text-zinc-400 text-[10px] uppercase font-bold">
            Alunos Ativos
          </p>
          <p className="text-white font-black text-lg">{active}</p>
        </div>
        <div className="w-px h-8 bg-zinc-800" />
        <div>
          <p className="text-zinc-400 text-[10px] uppercase font-bold">
            Novos (Hoje)
          </p>
          <p className="text-green-500 font-black text-lg">+{newToday}</p>
        </div>
      </div>
    </div>
  );
}
