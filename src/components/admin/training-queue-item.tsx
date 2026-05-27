import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { UserProfile } from "@/lib/types"

type TrainingQueueItemProps = {
  student: UserProfile
}

export function TrainingQueueItem({ student }: TrainingQueueItemProps) {
  return (
    <Link
      href={`/admin/alunos/${student.id}`}
      className="bg-zinc-900 border border-red-900/50 p-4 rounded-xl mb-3 flex items-center justify-between active:scale-95 transition-transform relative overflow-hidden block"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.full_name}`}
            alt={student.full_name}
          />
        </div>
        <div>
          <p className="font-bold text-white leading-tight">{student.full_name}</p>
          <span className="text-[9px] uppercase font-bold bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded mt-1 inline-block">
            Aguardando IA
          </span>
        </div>
      </div>
      <ChevronRight size={20} className="text-zinc-600" />
    </Link>
  )
}
