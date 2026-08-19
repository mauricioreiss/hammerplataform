import { BrainCircuit } from "lucide-react";
import { KpiCard } from "@/components/admin/kpi-card";
import { TrainingQueueItem } from "@/components/admin/training-queue-item";
import { RealtimeStudentListener } from "@/components/admin/realtime-student-listener";
import { getKpis, getAlunosAguardando } from "@/app/actions";

export default async function AdminPage() {
  const [kpis, aguardando] = await Promise.all([
    getKpis(),
    getAlunosAguardando(),
  ]);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in pb-24">
      <RealtimeStudentListener />
      <KpiCard mrr={kpis.mrr} active={kpis.total} newToday={kpis.novosHoje} />

      <div>
        <h3 className="text-zinc-400 font-bold uppercase text-xs mb-3 tracking-wider flex items-center gap-2">
          <BrainCircuit size={14} /> Fila de Treinos (IA)
        </h3>
        {aguardando.length === 0 && (
          <p className="text-zinc-600 text-xs">Nenhum aluno aguardando.</p>
        )}
        {aguardando.map((student) => (
          <TrainingQueueItem key={student.id} student={student} />
        ))}
      </div>
    </div>
  );
}
