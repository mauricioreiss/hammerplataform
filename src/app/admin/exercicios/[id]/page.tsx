import { notFound } from "next/navigation"
import { getExerciseById } from "../actions"
import { ExerciseEditor } from "./exercise-editor"

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const exercise = await getExerciseById(id)

  if (!exercise) notFound()

  return <ExerciseEditor exercise={exercise} />
}
