import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { Student } from "@/lib/mock-data"

type StudentListItemProps = {
  student: Student
}

export function StudentListItem({ student }: StudentListItemProps) {
  return (
    <Link
      href={`/admin/alunos/${student.id}`}
      className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center justify-between active:bg-zinc-800 transition-colors block"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
            alt={student.name}
          />
        </div>
        <div>
          <p className="font-bold text-white text-sm">{student.name}</p>
          <p className="text-[10px] text-zinc-500 font-bold uppercase">
            {student.objective} &bull; {student.plan}
          </p>
        </div>
      </div>
      <ChevronRight size={20} className="text-zinc-600" />
    </Link>
  )
}
