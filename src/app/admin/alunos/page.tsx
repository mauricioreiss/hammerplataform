import { Search } from "lucide-react"
import { StudentListItem } from "@/components/admin/student-list-item"
import { AddStudentForm } from "@/components/admin/add-student-form"
import { getAlunos } from "@/app/actions"

export default async function AlunosPage() {
  const students = await getAlunos()

  return (
    <div className="p-4 md:p-6 space-y-4 animate-in fade-in pb-24">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-black italic text-white uppercase tracking-tight">
          Alunos
        </h2>
        <AddStudentForm />
      </div>

      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar aluno..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      {students.length === 0 && (
        <p className="text-zinc-600 text-sm text-center pt-8">Nenhum aluno cadastrado.</p>
      )}

      <div className="space-y-3">
        {students.map((student) => (
          <StudentListItem key={student.id} student={student} />
        ))}
      </div>
    </div>
  )
}
