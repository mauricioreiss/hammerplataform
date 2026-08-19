import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { getWorkoutsDoAluno, getLastFinishedWorkoutId } from "@/app/actions";

export default async function TreinoPage() {
  const [workouts, lastFinishedId] = await Promise.all([
    getWorkoutsDoAluno(),
    getLastFinishedWorkoutId(),
  ]);

  if (workouts.length === 0) {
    return (
      <div className="py-6 pb-24 md:pb-6 animate-in fade-in duration-300">
        <div className="text-center pt-16">
          <p className="text-zinc-500 text-sm font-bold uppercase">
            Nenhum treino disponivel
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            Aguarde o treinador montar sua ficha.
          </p>
        </div>
      </div>
    );
  }

  // Determine next workout in rotation
  let nextIndex = 0;
  if (lastFinishedId && workouts.length > 1) {
    const lastIdx = workouts.findIndex((w) => w.id === lastFinishedId);
    if (lastIdx !== -1) {
      nextIndex = (lastIdx + 1) % workouts.length;
    }
  }

  return (
    <div className="py-6 space-y-4 pb-24 md:pb-6 animate-in fade-in duration-300">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-black italic text-white uppercase tracking-tight">
          Seus Treinos
        </h1>
      </div>

      <div className="space-y-3">
        {workouts.map((workout, i) => {
          const isNext = i === nextIndex;
          const exerciseCount = workout.exercises?.length ?? 0;

          return (
            <Link
              key={workout.id}
              href={`/aluno/treino/${workout.id}`}
              className={`block rounded-2xl p-5 border transition-all active:scale-[0.98] ${
                isNext
                  ? "bg-zinc-900 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.15)]"
                  : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isNext
                        ? "bg-red-600/20 border border-red-600/30"
                        : "bg-zinc-800 border border-zinc-700"
                    }`}
                  >
                    {workout.icon ? (
                      <span className="text-lg">{workout.icon}</span>
                    ) : (
                      <Dumbbell
                        size={18}
                        className={isNext ? "text-red-500" : "text-zinc-400"}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-black uppercase text-sm ${isNext ? "text-red-500" : "text-white"}`}
                    >
                      {workout.title}
                    </p>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase">
                      {exerciseCount} exercicio{exerciseCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                {isNext && (
                  <span className="text-[9px] bg-red-600/20 text-red-500 px-2 py-1 rounded font-black uppercase border border-red-600/30">
                    Proximo
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
