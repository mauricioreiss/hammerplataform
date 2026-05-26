import { notFound } from "next/navigation"
import { getStudentById, getAvaliacoesByStudentId } from "@/lib/mock-data"
import { StudentProfile } from "@/components/admin/student-profile"

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const student = getStudentById(Number(id))

  if (!student) notFound()

  const avaliacoes = getAvaliacoesByStudentId(student.id)

  return <StudentProfile student={student} avaliacoes={avaliacoes} />
}
