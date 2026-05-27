import { notFound } from "next/navigation"
import { getAlunoById, getAvaliacoes } from "@/app/actions"
import { StudentProfile } from "@/components/admin/student-profile"

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const student = await getAlunoById(id)

  if (!student) notFound()

  const avaliacoes = await getAvaliacoes(student.id)

  return <StudentProfile student={student} avaliacoes={avaliacoes} />
}
