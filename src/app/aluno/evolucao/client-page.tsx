"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Scale, TrendingDown, TrendingUp, LineChart as LineChartIcon, Dumbbell } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Evaluation } from "@/lib/types";
import type { TreinoEvolutionEntry } from "@/app/actions";

type EvolucaoClientPageProps = {
  avaliacoes: Evaluation[];
  treinoEvolution: TreinoEvolutionEntry[];
};

export function EvolucaoClientPage({
  avaliacoes,
  treinoEvolution,
}: EvolucaoClientPageProps) {
  const [activeTab, setActiveTab] = useState<"fisica" | "cargas">("fisica");

  // --- Fisica Logic ---
  const hasEnoughForComparativo = avaliacoes.length >= 2;
  const after = avaliacoes[0];
  const before = avaliacoes[avaliacoes.length - 1];

  const pesoDiff = (before?.weight ?? 0) - (after?.weight ?? 0);
  const bfDiff = (before?.body_fat ?? 0) - (after?.body_fat ?? 0);
  const magraDiff = (after?.lean_mass ?? 0) - (before?.lean_mass ?? 0);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

  // --- Treino Logic ---
  const groupedByWorkout = useMemo(() => {
    const map = new Map<string, TreinoEvolutionEntry[]>();
    treinoEvolution.forEach((entry) => {
      if (!map.has(entry.workoutTitle)) {
        map.set(entry.workoutTitle, []);
      }
      map.get(entry.workoutTitle)!.push(entry);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [treinoEvolution]);

  return (
    <div className="py-6 space-y-6 pb-32 md:pb-10 animate-in fade-in duration-300">
      <div className="text-center mb-6 pt-2">
        <h2 className="text-3xl font-black italic text-red-600 uppercase tracking-tighter">
          Seus Resultados
        </h2>
        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">
          Acompanhamento de Evolução
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mx-auto max-w-sm">
        <button
          onClick={() => setActiveTab("fisica")}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-colors ${
            activeTab === "fisica"
              ? "bg-red-600 text-white"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Scale size={14} /> Física
        </button>
        <button
          onClick={() => setActiveTab("cargas")}
          className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-colors ${
            activeTab === "cargas"
              ? "bg-red-600 text-white"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <LineChartIcon size={14} /> Treino
        </button>
      </div>

      {/* Taba: Física */}
      {activeTab === "fisica" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          {!hasEnoughForComparativo ? (
            <div className="text-center pt-16">
              <Scale size={48} className="mx-auto mb-4 text-zinc-700" />
              <p className="text-zinc-500 text-sm font-bold uppercase">
                {avaliacoes.length === 0
                  ? "Nenhuma avaliação registrada"
                  : "Apenas 1 avaliação registrada"}
              </p>
              <p className="text-zinc-600 text-xs mt-1">
                São necessárias pelo menos 2 avaliações para gerar o comparativo.
              </p>
            </div>
          ) : (
            <>
              {/* Date range */}
              <div className="flex justify-between items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                <div className="text-center flex-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">
                    Início
                  </span>
                  <p className="text-white font-bold text-sm">
                    {formatDate(before.date)}
                  </p>
                </div>
                <div className="text-zinc-600">&rarr;</div>
                <div className="text-center flex-1">
                  <span className="text-[9px] text-red-500 font-bold uppercase">
                    Atual
                  </span>
                  <p className="text-white font-bold text-sm">
                    {formatDate(after.date)}
                  </p>
                </div>
              </div>

              {/* Photos */}
              {(before.photo_url || after.photo_url) && (
                <div>
                  <h3 className="text-white font-black italic uppercase text-sm mb-3 flex items-center gap-2">
                    Evolução Física
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {before.photo_url && (
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800">
                        <Image
                          src={before.photo_url}
                          alt="Antes"
                          fill
                          sizes="(max-width: 768px) 50vw, 300px"
                          className="object-cover grayscale"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white uppercase backdrop-blur">
                          Antes
                        </div>
                      </div>
                    )}
                    {after.photo_url && (
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                        <Image
                          src={after.photo_url}
                          alt="Depois"
                          fill
                          sizes="(max-width: 768px) 50vw, 300px"
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-red-600 px-2 py-1 rounded text-[10px] font-bold text-white uppercase shadow-lg">
                          Atual
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div>
                <h3 className="text-white font-black italic uppercase text-sm mb-3 flex items-center gap-2">
                  <Scale size={14} className="text-zinc-500" /> Números
                </h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  {/* Peso */}
                  <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
                    <div className="w-1/3">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">
                        Peso
                      </p>
                    </div>
                    <div className="w-1/3 text-center">
                      <p className="text-zinc-500 text-xs line-through">
                        {before.weight ?? "—"} kg
                      </p>
                      <p className="text-white font-black text-base">
                        {after.weight ?? "—"} kg
                      </p>
                    </div>
                    <div className="w-1/3 flex justify-end">
                      <span
                        className={`${pesoDiff > 0 ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-red-500/20 text-red-500 border-red-500/30"} border px-2 py-1 rounded flex items-center gap-1 font-bold text-[10px]`}
                      >
                        <TrendingDown size={12} /> {pesoDiff.toFixed(1)} kg
                      </span>
                    </div>
                  </div>

                  {/* Gordura */}
                  <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
                    <div className="w-1/3">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">
                        % Gordura
                      </p>
                    </div>
                    <div className="w-1/3 text-center">
                      <p className="text-zinc-500 text-xs line-through">
                        {before.body_fat ?? "—"} %
                      </p>
                      <p className="text-white font-black text-base">
                        {after.body_fat ?? "—"} %
                      </p>
                    </div>
                    <div className="w-1/3 flex justify-end">
                      <span
                        className={`${bfDiff > 0 ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-red-500/20 text-red-500 border-red-500/30"} border px-2 py-1 rounded flex items-center gap-1 font-bold text-[10px]`}
                      >
                        <TrendingDown size={12} /> {bfDiff.toFixed(1)} %
                      </span>
                    </div>
                  </div>

                  {/* Massa Magra */}
                  <div className="flex items-center justify-between p-4">
                    <div className="w-1/3">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">
                        M. Magra
                      </p>
                    </div>
                    <div className="w-1/3 text-center">
                      <p className="text-zinc-500 text-xs line-through">
                        {before.lean_mass ?? "—"} kg
                      </p>
                      <p className="text-white font-black text-base">
                        {after.lean_mass ?? "—"} kg
                      </p>
                    </div>
                    <div className="w-1/3 flex justify-end">
                      <span
                        className={`${magraDiff > 0 ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-red-500/20 text-red-500 border-red-500/30"} border px-2 py-1 rounded flex items-center gap-1 font-bold text-[10px]`}
                      >
                        <TrendingUp size={12} /> {magraDiff.toFixed(1)} kg
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-[10px] uppercase font-bold text-zinc-500 pt-4">
                Avaliação inserida pelo treinador. Não editável.
              </p>
            </>
          )}
        </div>
      )}

      {/* Aba: Cargas de Treino */}
      {activeTab === "cargas" && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
          {groupedByWorkout.length === 0 ? (
            <div className="text-center pt-16">
              <Dumbbell size={48} className="mx-auto mb-4 text-zinc-700" />
              <p className="text-zinc-500 text-sm font-bold uppercase">
                Nenhuma carga registrada
              </p>
              <p className="text-zinc-600 text-xs mt-1">
                Ao finalizar treinos preenchendo as cargas, seu progresso
                aparecerá aqui.
              </p>
            </div>
          ) : (
            groupedByWorkout.map(([workoutTitle, logs]) => {
              // Group logs by exercise inside this workout
              const byExercise = new Map<string, TreinoEvolutionEntry[]>();
              logs.forEach((l) => {
                if (!byExercise.has(l.exerciseName)) byExercise.set(l.exerciseName, []);
                byExercise.get(l.exerciseName)!.push(l);
              });

              return (
                <div key={workoutTitle} className="space-y-4">
                  <h3 className="text-white font-black italic uppercase text-lg border-b border-zinc-800 pb-2">
                    {workoutTitle}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(byExercise.entries()).map(([exerciseName, exLogs]) => {
                      // We need at least 1 log to show something.
                      const firstLog = exLogs[0];
                      const lastLog = exLogs[exLogs.length - 1];
                      const diff = lastLog.weight - firstLog.weight;
                      
                      // Format data for chart
                      const chartData = exLogs.map(l => ({
                        date: new Date(l.date).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' }),
                        weight: l.weight
                      }));

                      return (
                        <div key={exerciseName} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">
                                {firstLog.muscleGroup}
                              </p>
                              <h4 className="text-white font-bold text-sm uppercase">
                                {exerciseName}
                              </h4>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-black text-lg">
                                {lastLog.weight} kg
                              </p>
                              {diff !== 0 && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center justify-end gap-1 ${diff > 0 ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"}`}>
                                  {diff > 0 ? "+" : ""}{diff} kg desde o início
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Mini Chart */}
                          {exLogs.length > 1 ? (
                            <div className="h-32 w-full mt-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                  <XAxis 
                                    dataKey="date" 
                                    tick={{fontSize: 10, fill: '#71717a'}} 
                                    tickMargin={8}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#dc2626' }}
                                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="weight" 
                                    name="Carga (kg)"
                                    stroke="#dc2626" 
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#dc2626', strokeWidth: 2, stroke: '#18181b' }}
                                    activeDot={{ r: 6, fill: '#dc2626', stroke: '#fff' }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="h-32 w-full mt-4 flex items-center justify-center bg-zinc-950 rounded-lg border border-zinc-800">
                              <p className="text-zinc-600 text-[10px] font-bold uppercase text-center px-4">
                                Continue treinando para<br/>gerar o gráfico
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
