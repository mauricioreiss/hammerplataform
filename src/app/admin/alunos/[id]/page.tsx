import { notFound } from "next/navigation"
import {
  getAlunoById,
  getAvaliacoes,
  getTreinosComExercicios,
  getLibraryExercises,
} from "@/app/actions"
import { StudentProfile } from "@/components/admin/student-profile"

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const student = await getAlunoById(id)

  if (!student) notFound()

  const [avaliacoes, workouts, libraryExercises] = await Promise.all([
    getAvaliacoes(student.id),
    getTreinosComExercicios(student.id),
    getLibraryExercises(),
  ])

  return (
    <StudentProfile
      student={student}
      avaliacoes={avaliacoes}
      workouts={workouts}
      libraryExercises={libraryExercises}
    />
  )
}
