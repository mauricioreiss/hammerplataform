"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Activity, BrainCircuit } from "lucide-react"
import type { Student, Avaliacao } from "@/lib/mock-data"
import { AvaliacaoCard } from "./avaliacao-card"
import { ComparativoView } from "./comparativo-view"

type StudentProfileProps = {
  student: Student
  avaliacoes: Avaliacao[]
}

export function StudentProfile({ student, avaliacoes }: StudentProfileProps) {
  const [activeTab, setActiveTab] = useState<"treinos" | "avaliacoes">(
    "avaliacoes",
  )
  const [showComparativo, setShowComparativo] = useState(false)

  const hasEnoughForComparativo = avaliacoes.length >= 2
  const before = avaliacoes[avaliacoes.length - 1]
  const after = avaliacoes[0]

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Profile header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 pt-4 pb-4">
        <Link
          href="/admin/alunos"
          className="text-zinc-400 active:text-white mb-4 flex items-center gap-2 text-xs font-bold uppercase"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-red-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
              alt={student.name}
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase">
              {student.name}
            </h2>
            <div className="flex gap-2 mt-1">
              <span className="text-[9px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded font-bold uppercase border border-green-500/30">
                Plano Ativo
              </span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase pt-0.5">
                Desde Jan/26
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950 px-4">
        <button
          onClick={() => {
            setActiveTab("treinos")
            setShowComparativo(false)
          }}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
            activeTab === "treinos"
              ? "border-red-600 text-red-500"
              : "border-transparent text-zinc-500"
          }`}
        >
          Fichas de Treino
        </button>
        <button
          onClick={() => {
            setActiveTab("avaliacoes")
            setShowComparativo(false)
          }}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
            activeTab === "avaliacoes"
              ? "border-red-600 text-red-500"
              : "border-transparent text-zinc-500"
          }`}
        >
          Avaliações Físicas
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-black p-4 pb-24">
        {/* Avaliacoes list */}
        {activeTab === "avaliacoes" && !showComparativo && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="bg-zinc-900 border border-zinc-800 text-white font-bold py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-2 active:bg-zinc-800 transition-colors">
                <Plus size={16} /> Nova Avaliação
              </button>
              {hasEnoughForComparativo && (
                <button
                  onClick={() => setShowComparativo(true)}
                  className="bg-red-600 border border-red-500 text-white font-black py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  <Activity size={16} /> Gerar Comparativo
                </button>
              )}
            </div>

            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              Histórico
            </h3>

            {avaliacoes.map((av, index) => (
              <AvaliacaoCard
                key={av.id}
                avaliacao={av}
                isLatest={index === 0}
              />
            ))}

            {avaliacoes.length === 0 && (
              <div className="text-center text-zinc-500 pt-10">
                <p className="text-xs">Nenhuma avaliação registrada.</p>
              </div>
            )}
          </div>
        )}

        {/* Comparativo */}
        {activeTab === "avaliacoes" && showComparativo && before && after && (
          <ComparativoView before={before} after={after} />
        )}

        {/* Treinos placeholder */}
        {activeTab === "treinos" && (
          <div className="text-center text-zinc-500 pt-10">
            <BrainCircuit size={48} className="mx-auto mb-4 opacity-50" />
            <p className="uppercase font-bold text-sm text-white">
              Treinos do Aluno
            </p>
            <p className="text-xs mt-2">Acesso ao construtor de IA.</p>
          </div>
        )}
      </div>
    </div>
  )
}
