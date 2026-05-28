import Image from "next/image"
import {
  ChevronRight,
  Scale,
  TrendingDown,
  TrendingUp,
  Share2,
} from "lucide-react"
import type { Evaluation } from "@/lib/types"

type ComparativoViewProps = {
  before: Evaluation
  after: Evaluation
}

function formatMonth(dateStr: string): string {
  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const d = new Date(dateStr)
  return `${MONTHS[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
}

type MetricRowProps = {
  label: string
  oldValue: string
  newValue: string
  diff: string
  improved: boolean
  direction: "down" | "up"
  showStrikethrough: boolean
  isLast?: boolean
}

function MetricRow({
  label,
  oldValue,
  newValue,
  diff,
  improved,
  direction,
  showStrikethrough,
  isLast,
}: MetricRowProps) {
  const TrendIcon = direction === "down" ? TrendingDown : TrendingUp
  const badgeColor = improved
    ? "bg-green-500/20 text-green-500 border-green-500/30"
    : "bg-red-500/20 text-red-500 border-red-500/30"

  return (
    <div
      className={`flex items-center justify-between p-4 ${!isLast ? "border-b border-zinc-800/50" : ""}`}
    >
      <div className="w-1/3">
        <p className="text-xs text-zinc-400 font-bold uppercase">{label}</p>
      </div>
      <div className="w-1/3 text-center">
        <p
          className={`text-zinc-500 text-sm ${showStrikethrough ? "line-through decoration-red-500/50" : ""}`}
        >
          {oldValue}
        </p>
        <p className="text-white font-black text-lg">{newValue}</p>
      </div>
      <div className="w-1/3 flex justify-end">
        <span
          className={`${badgeColor} border px-2 py-1 rounded flex items-center gap-1 font-bold text-xs`}
        >
          <TrendIcon size={14} /> {diff}
        </span>
      </div>
    </div>
  )
}

export function ComparativoView({ before, after }: ComparativoViewProps) {
  const pesoDiff = (before.weight ?? 0) - (after.weight ?? 0)
  const bfDiff = (before.body_fat ?? 0) - (after.body_fat ?? 0)
  const magraDiff = (after.lean_mass ?? 0) - (before.lean_mass ?? 0)
  const cinturaDiff = (before.waist ?? 0) - (after.waist ?? 0)

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-300">
      {/* Date range header */}
      <div className="flex justify-between items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800">
        <div className="text-center flex-1">
          <span className="text-[9px] text-zinc-500 font-bold uppercase">
            Avaliação 1
          </span>
          <p className="text-white font-bold text-sm">
            {formatMonth(before.date)}
          </p>
        </div>
        <div className="text-zinc-600">
          <ChevronRight size={20} />
        </div>
        <div className="text-center flex-1">
          <span className="text-[9px] text-red-500 font-bold uppercase">
            Avaliação 2 (Atual)
          </span>
          <p className="text-white font-bold text-sm">
            {formatMonth(after.date)}
          </p>
        </div>
      </div>

      {/* Photo comparison */}
      {(before.photo_url || after.photo_url) && (
        <div>
          <h3 className="text-white font-black italic uppercase text-lg mb-3 flex items-center gap-2">
            Físico
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {before.photo_url && (
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800">
                <Image
                  src={before.photo_url}
                  alt="Antes"
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover grayscale"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white uppercase backdrop-blur">
                  Antes
                </div>
              </div>
            )}
            {after.photo_url && (
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                <Image
                  src={after.photo_url}
                  alt="Depois"
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-red-600 px-2 py-1 rounded text-[10px] font-bold text-white uppercase shadow-lg">
                  Atual
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Body metrics comparison */}
      <div>
        <h3 className="text-white font-black italic uppercase text-lg mb-3 flex items-center gap-2">
          <Scale size={18} className="text-zinc-500" /> Evolução Corporal
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <MetricRow
            label="Peso Total"
            oldValue={`${before.weight ?? "—"} kg`}
            newValue={`${after.weight ?? "—"} kg`}
            diff={`${pesoDiff.toFixed(1)} kg`}
            improved={pesoDiff > 0}
            direction="down"
            showStrikethrough
          />
          <MetricRow
            label="% Gordura"
            oldValue={`${before.body_fat ?? "—"} %`}
            newValue={`${after.body_fat ?? "—"} %`}
            diff={`${bfDiff.toFixed(1)} %`}
            improved={bfDiff > 0}
            direction="down"
            showStrikethrough
          />
          <MetricRow
            label="M. Magra"
            oldValue={`${before.lean_mass ?? "—"} kg`}
            newValue={`${after.lean_mass ?? "—"} kg`}
            diff={`${magraDiff.toFixed(1)} kg`}
            improved={magraDiff > 0}
            direction="up"
            showStrikethrough={false}
          />
          <MetricRow
            label="Cintura"
            oldValue={`${before.waist ?? "—"} cm`}
            newValue={`${after.waist ?? "—"} cm`}
            diff={`${cinturaDiff.toFixed(0)} cm`}
            improved={cinturaDiff > 0}
            direction="down"
            showStrikethrough
            isLast
          />
        </div>
      </div>

      {/* WhatsApp share */}
      <button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
        <Share2 size={18} /> Compartilhar no WhatsApp
      </button>
    </div>
  )
}
