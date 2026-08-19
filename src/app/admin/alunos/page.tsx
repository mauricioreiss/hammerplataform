import { AddStudentForm } from "@/components/admin/add-student-form";
import { StudentListWithSearch } from "@/components/admin/student-list-with-search";
import { RealtimeStudentListener } from "@/components/admin/realtime-student-listener";
import { getAlunos, getPlans } from "@/app/actions";

export default async function AlunosPage() {
  const [students, plans] = await Promise.all([getAlunos(), getPlans()]);

  return (
    <div className="p-4 md:p-6 space-y-4 animate-in fade-in pb-24">
      <RealtimeStudentListener />
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-black italic text-white uppercase tracking-tight">
          Alunos
        </h2>
        <AddStudentForm plans={plans} />
      </div>

      <StudentListWithSearch students={students} />
    </div>
  );
}
