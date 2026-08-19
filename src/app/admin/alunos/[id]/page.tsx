import { notFound } from "next/navigation";
import {
  getAlunoById,
  getAvaliacoes,
  getTreinosComExercicios,
  getLibraryExercises,
  getStudentQuickStatus,
  getRecentSessions,
  getAnamneseByUserId,
} from "@/app/actions";
import { StudentProfile } from "@/components/admin/student-profile";
import { RealtimeProfileListener } from "@/components/admin/realtime-profile-listener";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getAlunoById(id);

  if (!student) notFound();

  const [
    avaliacoes,
    workouts,
    libraryExercises,
    quickStatus,
    recentSessions,
    anamnesis,
  ] = await Promise.all([
    getAvaliacoes(student.id),
    getTreinosComExercicios(student.id),
    getLibraryExercises(),
    getStudentQuickStatus(student.id),
    getRecentSessions(student.id),
    getAnamneseByUserId(student.id),
  ]);

  return (
    <>
      <RealtimeProfileListener userId={student.id} />
      <StudentProfile
        student={student}
        avaliacoes={avaliacoes}
        workouts={workouts}
        libraryExercises={libraryExercises}
        quickStatus={quickStatus}
        recentSessions={recentSessions}
        anamnesis={anamnesis}
      />
    </>
  );
}
