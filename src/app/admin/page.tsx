import { BrainCircuit } from "lucide-react"
import { KpiCard } from "@/components/admin/kpi-card"
import { TrainingQueueItem } from "@/components/admin/training-queue-item"
import { kpis, studentsQueue } from "@/lib/mock-data"

export default function AdminPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in pb-24">
      <KpiCard mrr={kpis.mrr} active={kpis.active} newToday={kpis.new} />

      <div>
        <h3 className="text-zinc-400 font-bold uppercase text-xs mb-3 tracking-wider flex items-center gap-2">
          <BrainCircuit size={14} /> Fila de Treinos (IA)
        </h3>
        {studentsQueue.map((student) => (
          <TrainingQueueItem key={student.id} student={student} />
        ))}
      </div>
    </div>
  )
}
