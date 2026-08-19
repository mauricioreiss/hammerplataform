"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, Minus, X } from "lucide-react";
import {
  getExerciseWeightHistory,
  type WeightHistoryEntry,
} from "@/app/actions";

type ExerciseHistoryModalProps = {
  exerciseId: string;
  exerciseName: string;
  onClose: () => void;
};

function trendFor(current: number, previous: number | undefined) {
  if (previous == null) return { Icon: Minus, color: "text-yellow-500" };
  if (current > previous) return { Icon: TrendingUp, color: "text-green-500" };
  if (current < previous) return { Icon: TrendingDown, color: "text-red-500" };
  return { Icon: Minus, color: "text-yellow-500" };
}

export function ExerciseHistoryModal({
  exerciseId,
  exerciseName,
  onClose,
}: ExerciseHistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<WeightHistoryEntry[]>([]);

  useEffect(() => {
    let active = true;
    getExerciseWeightHistory(exerciseId).then((data) => {
      if (active) {
        setHistory(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [exerciseId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="min-w-0">
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">
              Evolução de Carga
            </p>
            <h3 className="text-white font-black uppercase text-sm truncate">
              {exerciseName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-zinc-600" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-zinc-500 text-xs text-center py-10">
              Nenhum registro de carga ainda. Finalize um treino com o peso
              preenchido.
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((entry, i) => {
                // history is newest-first, so the next item is the previous run.
                const { Icon, color } = trendFor(
                  entry.weight,
                  history[i + 1]?.weight,
                );
                return (
                  <div
                    key={`${entry.date}-${i}`}
                    className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5"
                  >
                    <span className="text-zinc-500 text-[10px] font-bold uppercase">
                      {new Date(entry.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-white text-sm font-black">
                        {entry.weight} kg
                      </span>
                      <Icon size={16} className={color} />
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
