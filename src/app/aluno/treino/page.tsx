import { WorkoutSession } from "@/components/aluno/workout-session"
import { todayWorkout } from "@/lib/mock-data"

export default function TreinoPage() {
  return <WorkoutSession workout={todayWorkout} />
}
