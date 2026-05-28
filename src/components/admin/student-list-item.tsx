import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { UserProfile } from "@/lib/types"

type StudentListItemProps = {
  student: UserProfile
}

export function StudentListItem({ student }: StudentListItemProps) {
  const initials = student.full_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <Link
      href={`/admin/alunos/${student.id}`}
      className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center justify-between active:bg-zinc-800 transition-colors block"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center border border-zinc-700">
          {student.avatar_url ? (
            <Image
              src={student.avatar_url}
              alt={student.full_name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-sm">{initials}</span>
          )}
        </div>
        <div>
          <p className="font-bold text-white text-sm">{student.full_name}</p>
          <p className="text-[10px] text-zinc-500 font-bold uppercase">
            {student.objective} &bull; {student.plan_name ?? "Mensal"}
          </p>
        </div>
      </div>
      <ChevronRight size={20} className="text-zinc-600" />
    </Link>
  )
}
