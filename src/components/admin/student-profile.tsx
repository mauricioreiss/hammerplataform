"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Activity, Calendar, CheckCircle2, MoreVertical, Key, CreditCard, ShieldOff, ShieldCheck, Loader2, ClipboardList } from "lucide-react"
import type { UserProfile, Evaluation, Workout, Exercise, Anamnesis } from "@/lib/types"
import { registerPayment, blockStudent, unblockStudent } from "@/app/actions"
import { AvaliacaoCard } from "./avaliacao-card"
import { ComparativoView } from "./comparativo-view"
import { WorkoutBuilder } from "./workout-builder"
import { AddAvaliacaoModal } from "./add-avaliacao-modal"
import { ResetPasswordModal } from "./reset-password-modal"

type StudentProfileProps = {
  student: UserProfile
  avaliacoes: Evaluation[]
  workouts: Workout[]
  libraryExercises: Exercise[]
  quickStatus: {
    lastEvalDate: string | null
    completedExercises: number
  }
  anamnesis: Anamnesis | null
}

export function StudentProfile({ student, avaliacoes, workouts, libraryExercises, quickStatus, anamnesis }: StudentProfileProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"treinos" | "avaliacoes">("avaliacoes")
  const [showComparativo, setShowComparativo] = useState(false)
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)

  const hasEnoughForComparativo = avaliacoes.length >= 2
  const before = avaliacoes[avaliacoes.length - 1]
  const after = avaliacoes[0]

  const isExpired = student.expire_date && new Date(student.expire_date) < new Date()

  const statusLabel =
    student.plan_status === "blocked" ? "Bloqueado" :
    student.plan_status === "review" ? "Aguardando Pagamento" :
    student.plan_status === "pending" ? "Pendente" :
    student.plan_status === "atrasado" ? "Atrasado" :
    student.plan_status === "vencendo" ? "Vencendo" :
    isExpired ? "Expirado" : "Ativo"

  const statusColor =
    student.plan_status === "blocked" || student.plan_status === "atrasado" || isExpired
      ? "bg-red-500/20 text-red-500 border-red-500/30"
      : student.plan_status === "pending" || student.plan_status === "review" || student.plan_status === "vencendo"
        ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
        : "bg-green-500/20 text-green-500 border-green-500/30"

  async function handleRegisterPayment() {
    setPaymentLoading(true)
    await registerPayment(student.id)
    setPaymentLoading(false)
    router.refresh()
  }

  async function handleBlock() {
    setBlockLoading(true)
    await blockStudent(student.id)
    setBlockLoading(false)
    setShowBlockConfirm(false)
    router.refresh()
  }

  async function handleUnblock() {
    setBlockLoading(true)
    await unblockStudent(student.id)
    setBlockLoading(false)
    router.refresh()
  }

  const isBlocked = student.plan_status === "blocked"

  const since = new Date(student.created_at).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  })

  const initials = student.full_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Profile header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 md:px-8 pt-4 pb-4">
        <Link
          href="/admin/alunos"
          className="text-zinc-400 active:text-white mb-4 flex items-center gap-2 text-xs font-bold uppercase"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-red-600 flex items-center justify-center">
              {student.avatar_url ? (
                <Image
                  src={student.avatar_url}
                  alt={student.full_name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">{initials}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase">
                {student.full_name}
              </h2>
              <div className="flex gap-2 mt-1">
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${statusColor}`}>
                  {statusLabel}
                </span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase pt-0.5">
                  Desde {since}
                </span>
              </div>
            </div>
          </div>

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <MoreVertical size={20} />
            </button>
            {showActionsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowActionsMenu(false)}
                />
                <div className="absolute right-0 top-10 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden w-48 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      setShowResetPassword(true)
                      setShowActionsMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left text-xs font-bold uppercase text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                  >
                    <Key size={14} /> Resetar Senha
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Financial Card */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 md:px-8 py-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={14} className="text-zinc-500" />
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Financeiro</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
            <div>
              <p className="text-zinc-600 text-[9px] font-bold uppercase">Plano</p>
              <p className="text-white text-sm font-bold">{student.plan_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-zinc-600 text-[9px] font-bold uppercase">Status</p>
              <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border inline-block ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
            <div>
              <p className="text-zinc-600 text-[9px] font-bold uppercase">Valor</p>
              <p className="text-white text-sm font-bold">
                R$ {(student.plan_value ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-zinc-600 text-[9px] font-bold uppercase">Vencimento</p>
              <p className={`text-sm font-bold ${isExpired ? "text-red-500" : "text-white"}`}>
                {student.expire_date
                  ? new Date(student.expire_date).toLocaleDateString("pt-BR")
                  : "—"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRegisterPayment}
              disabled={paymentLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase py-2.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
            >
              {paymentLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              Registrar Pagamento
            </button>
            {isBlocked ? (
              <button
                onClick={handleUnblock}
                disabled={blockLoading}
                className="border border-zinc-600 text-zinc-300 font-bold uppercase py-2.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {blockLoading ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                Desbloquear Acesso
              </button>
            ) : !showBlockConfirm ? (
              <button
                onClick={() => setShowBlockConfirm(true)}
                className="border border-red-500/30 text-red-500 font-bold uppercase py-2.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 hover:bg-red-500/10 transition-colors"
              >
                <ShieldOff size={12} /> Bloquear Acesso
              </button>
            ) : (
              <button
                onClick={handleBlock}
                disabled={blockLoading}
                className="bg-red-600 text-white font-bold uppercase py-2.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 animate-in fade-in duration-150"
              >
                {blockLoading ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={12} />}
                Confirmar Bloqueio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Anamnese Card */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 md:px-8 py-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={14} className="text-zinc-500" />
            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Dados da Anamnese</p>
          </div>
          {anamnesis ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-zinc-600 text-[9px] font-bold uppercase">Objetivo</p>
                <p className="text-white text-sm font-bold">{student.objective ?? "—"}</p>
              </div>
              <div>
                <p className="text-zinc-600 text-[9px] font-bold uppercase">Peso / Altura</p>
                <p className="text-white text-sm font-bold">
                  {anamnesis.weight ? `${anamnesis.weight}kg` : "—"}
                  {" / "}
                  {anamnesis.height ? `${(anamnesis.height / 100).toFixed(2)}m` : "—"}
                </p>
              </div>
              <div>
                <p className="text-zinc-600 text-[9px] font-bold uppercase">Dias por Semana</p>
                <p className="text-white text-sm font-bold">{anamnesis.days_per_week ? `${anamnesis.days_per_week}x` : "—"}</p>
              </div>
              <div>
                <p className="text-zinc-600 text-[9px] font-bold uppercase">Lesoes / Dores</p>
                {anamnesis.injuries ? (
                  <p className="text-red-400 text-sm font-bold">{anamnesis.injuries}</p>
                ) : (
                  <p className="text-green-500 text-sm font-bold">Nenhuma</p>
                )}
              </div>
              {anamnesis.par_q_data && Object.values(anamnesis.par_q_data).some(Boolean) && (
                <div className="col-span-2">
                  <p className="text-zinc-600 text-[9px] font-bold uppercase mb-1">PAR-Q (Alertas)</p>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                    <p className="text-red-400 text-xs font-bold">Respondeu SIM em {Object.values(anamnesis.par_q_data).filter(Boolean).length} pergunta(s) do PAR-Q</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-zinc-500 text-xs">Nenhuma anamnese inicial registrada.</p>
          )}
        </div>
      </div>

      {/* Quick Status */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 md:px-8 py-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 text-[9px] font-bold uppercase">Ultima Avaliacao</p>
              <p className="text-white text-xs font-bold">
                {quickStatus.lastEvalDate
                  ? new Date(quickStatus.lastEvalDate).toLocaleDateString("pt-BR")
                  : "Nenhuma"}
              </p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} className="text-green-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-[9px] font-bold uppercase">Exercicios Feitos</p>
              <p className="text-white text-xs font-bold">{quickStatus.completedExercises}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950 px-4">
        <button
          onClick={() => { setActiveTab("treinos"); setShowComparativo(false) }}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
            activeTab === "treinos" ? "border-red-600 text-red-500" : "border-transparent text-zinc-500"
          }`}
        >
          Fichas de Treino
        </button>
        <button
          onClick={() => { setActiveTab("avaliacoes"); setShowComparativo(false) }}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
            activeTab === "avaliacoes" ? "border-red-600 text-red-500" : "border-transparent text-zinc-500"
          }`}
        >
          Avaliacoes Fisicas
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-black p-4 md:p-6 pb-24">
        {/* Avaliacoes */}
        {activeTab === "avaliacoes" && !showComparativo && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setShowAvaliacaoModal(true)}
                className="bg-zinc-900 border border-zinc-800 text-white font-bold py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-2 active:bg-zinc-800 transition-colors"
              >
                <Plus size={16} /> Nova Avaliacao
              </button>
              {hasEnoughForComparativo && (
                <button
                  onClick={() => setShowComparativo(true)}
                  className="bg-red-600 border border-red-500 text-white font-black py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  <Activity size={16} /> Comparativo
                </button>
              )}
            </div>

            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              Historico
            </h3>

            {avaliacoes.map((av, index) => (
              <AvaliacaoCard key={av.id} avaliacao={av} isLatest={index === 0} />
            ))}

            {avaliacoes.length === 0 && (
              <div className="text-center text-zinc-500 pt-10">
                <p className="text-xs">Nenhuma avaliacao registrada.</p>
              </div>
            )}
          </div>
        )}

        {/* Comparativo */}
        {activeTab === "avaliacoes" && showComparativo && before && after && (
          <ComparativoView before={before} after={after} />
        )}

        {/* Treinos */}
        {activeTab === "treinos" && (
          <WorkoutBuilder
            studentId={student.id}
            workouts={workouts}
            libraryExercises={libraryExercises}
          />
        )}
      </div>

      {/* Avaliacao Modal */}
      {showAvaliacaoModal && (
        <AddAvaliacaoModal
          studentId={student.id}
          onClose={() => setShowAvaliacaoModal(false)}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <ResetPasswordModal
          studentId={student.id}
          studentName={student.full_name}
          onClose={() => setShowResetPassword(false)}
        />
      )}
    </div>
  )
}
