"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { StudentListItem } from "./student-list-item"
import type { UserProfile } from "@/lib/types"

type StudentListWithSearchProps = {
  students: UserProfile[]
}

export function StudentListWithSearch({ students }: StudentListWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = searchTerm.trim()
    ? students.filter((s) =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : students

  return (
    <>
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar aluno por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-zinc-600 text-sm text-center pt-8">
          {searchTerm ? "Nenhum aluno encontrado." : "Nenhum aluno cadastrado."}
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((student) => (
          <StudentListItem key={student.id} student={student} />
        ))}
      </div>
    </>
  )
}
