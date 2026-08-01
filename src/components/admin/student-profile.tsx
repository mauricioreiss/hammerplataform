"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Activity, Calendar, CheckCircle2, MoreVertical, Key, CreditCard, ShieldOff, ShieldCheck, Loader2, ClipboardList, Trash2, Pencil, Timer, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, AlertTriangle, Sparkles, X } from "lucide-react"
import type { UserProfile, Evaluation, Workout, Exercise, Anamnesis } from "@/lib/types"
import { registerPayment, blockStudent, unblockStudent, deleteStudent, getSessionDetail } from "@/app/actions"
import type { QuickStatus, RecentSession, SessionExercise } from "@/app/actions"
import { AvaliacaoCard } from "./avaliacao-card"
import { ComparativoView } from "./comparativo-view"
import { WorkoutBuilder } from "./workout-builder"
import { AddAvaliacaoModal } from "./add-avaliacao-modal"
import { ResetPasswordModal } from "./reset-password-modal"
import { AnamneseModal } from "./anamnese-modal"

const PAR_Q_LABELS = [
  "Problema cardíaco diagnosticado",
  "Dor no peito durante atividade física",
  "Problema ósseo, articular ou muscular",
  "Medicamentos para pressão/coração",
  "Diabetes, hipertensão ou colesterol elevado",
]

// total_duration is stored in seconds.
function formatDuration(seconds: number): string {
  if (seconds < 60) return "< 1 min"
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`
  return `${m} min`
}

// Progressive-overload indicator: green up, red down, yellow flat/first time.
const TREND_ICON = {
  up: { Icon: TrendingUp, color: "text-green-500" },
  down: { Icon: TrendingDown, color: "text-red-500" },
  same: { Icon: Minus, color: "text-yellow-500" },
  first: { Icon: Minus, color: "text-yellow-500" },
} as const

function relativeDay(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86400000)
  if (diffDays === 0) return "Hoje"
  if (diffDays === 1) return "Ontem"
  if (diffDays < 7) return `${diffDays} dias atrás`
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

type StudentProfileProps = {
  student: UserProfile
  avaliacoes: Evaluation[]
  workouts: Workout[]
  libraryExercises: Exercise[]
  quickStatus: QuickStatus
  recentSessions: RecentSession[]
  anamnesis: Anamnesis | null
}

export function StudentProfile({ student, avaliacoes, workouts, libraryExercises, quickStatus, recentSessions, anamnesis }: StudentProfileProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"treinos" | "avaliacoes">("avaliacoes")
  const [showComparativo, setShowComparativo] = useState(false)
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showAnamneseModal, setShowAnamneseModal] = useState(false)
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
  const [sessionDetails, setSessionDetails] = useState<Record<string, SessionExercise[]>>({})
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null)

  // Copiloto de Treino: rascunho da IA aguardando revisao do admin.
  const aiDraft = workouts.find((w) => w.is_ai_draft && w.status === "draft" && w.ai_notes)
  const [showAiPopup, setShowAiPopup] = useState(() => !!aiDraft)
  const [reviewWorkoutId, setReviewWorkoutId] = useState<string | null>(null)

  function handleReviewDraft() {
    if (!aiDraft) return
    setShowAiPopup(false)
    setActiveTab("treinos")
    setReviewWorkoutId(aiDraft.id)
  }

  async function handleToggleSession(sessionId: string) {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null)
      return
    }
    setExpandedSessionId(sessionId)
    if (!sessionDetails[sessionId]) {
      setLoadingSessionId(sessionId)
      const detail = await getSessionDetail(sessionId)
      setSessionDetails((prev) => ({ ...prev, [sessionId]: detail }))
      setLoadingSessionId(null)
    }
  }

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

  async function handleDelete() {
    setDeleteLoading(true)
    const result = await deleteStudent(student.id)
    if (result.success) {
      router.push("/admin/alunos")
      return
    }
    setDeleteLoading(false)
    setShowDeleteConfirm(false)
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
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true)
                      setShowActionsMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left text-xs font-bold uppercase text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={14} /> Excluir Aluno
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList size={14} className="text-zinc-500" />
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Dados da Anamnese</p>
            </div>
            <button
              onClick={() => setShowAnamneseModal(true)}
              className="text-zinc-500 hover:text-white text-[10px] font-bold uppercase flex items-center gap-1 transition-colors"
            >
              <Pencil size={12} />
              {anamnesis ? "Editar" : "Preencher"}
            </button>
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
                <p className="text-zinc-600 text-[9px] font-bold uppercase">Lesões / Dores</p>
                {anamnesis.injuries ? (
                  <p className="text-red-400 text-sm font-bold">{anamnesis.injuries}</p>
                ) : (
                  <p className="text-green-500 text-sm font-bold">Nenhuma</p>
                )}
              </div>
              {anamnesis.par_q_data && Object.values(anamnesis.par_q_data).some(Boolean) && (
                <div className="col-span-2">
                  <p className="text-zinc-600 text-[9px] font-bold uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle size={10} className="text-yellow-500" />
                    PAR-Q (Alertas)
                  </p>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-1.5">
                    {PAR_Q_LABELS.filter((_, i) => anamnesis.par_q_data?.[`q${i}`]).map((label, i) => (
                      <p key={i} className="text-red-400 text-xs font-bold flex items-start gap-1.5">
                        <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                        {label}
                      </p>
                    ))}
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
              <p className="text-zinc-500 text-[9px] font-bold uppercase">Última Avaliação</p>
              <p className="text-white text-xs font-bold">
                {quickStatus.lastEvalDate
                  ? new Date(quickStatus.lastEvalDate).toLocaleDateString("pt-BR")
                  : "Nenhuma"}
              </p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
              <TrendingUp size={14} className="text-red-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-[9px] font-bold uppercase">Frequência da Semana</p>
              <p className="text-white text-xs font-bold">
                {quickStatus.weeklyWorkouts} treino{quickStatus.weeklyWorkouts !== 1 ? "s" : ""}
              </p>
              {quickStatus.weeklyDuration > 0 && (
                <p className="text-zinc-500 text-[10px] font-bold">
                  {formatDuration(quickStatus.weeklyDuration)} no total
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workout history */}
      {recentSessions.length > 0 && (
        <div className="bg-zinc-950 border-b border-zinc-800 px-4 md:px-8 py-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-zinc-500" />
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Últimos Treinos</p>
            </div>
            <div className="space-y-2">
              {recentSessions.map((s) => {
                const isOpen = expandedSessionId === s.id
                const detail = sessionDetails[s.id]
                return (
                  <div key={s.id} className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleToggleSession(s.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left active:bg-zinc-900 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-white text-xs font-bold truncate">{s.title}</p>
                        <p className="text-zinc-600 text-[10px] font-bold uppercase">{relativeDay(s.completed_at)}</p>
                      </div>
                      <span className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="flex items-center gap-1 text-zinc-400 text-[10px] font-bold">
                          <Timer size={11} />
                          {formatDuration(s.total_duration)}
                        </span>
                        {isOpen ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-zinc-800 px-3 py-2 space-y-1.5 animate-in fade-in duration-200">
                        {loadingSessionId === s.id ? (
                          <div className="flex justify-center py-3">
                            <Loader2 size={16} className="animate-spin text-zinc-600" />
                          </div>
                        ) : detail && detail.length > 0 ? (
                          detail.map((ex) => {
                            const { Icon, color } = TREND_ICON[ex.trend]
                            return (
                              <div key={ex.exerciseId} className="flex items-center justify-between py-1">
                                <p className="text-zinc-300 text-[11px] font-bold truncate min-w-0">{ex.name}</p>
                                <span className="flex items-center gap-1.5 shrink-0 ml-3">
                                  <span className="text-white text-[11px] font-black">
                                    {ex.currentWeight != null ? `${ex.currentWeight} kg` : "—"}
                                  </span>
                                  {ex.previousWeight != null && (
                                    <span className="text-zinc-600 text-[9px] font-bold">
                                      (ant. {ex.previousWeight})
                                    </span>
                                  )}
                                  <Icon size={14} className={color} />
                                </span>
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-zinc-600 text-[10px] text-center py-3">Sem cargas registradas nesta sessão.</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950 px-4">
        <button
          onClick={() => { setActiveTab("treinos"); setShowComparativo(false) }}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "treinos" ? "border-red-600 text-red-500" : "border-transparent text-zinc-500"
            }`}
        >
          Fichas de Treino
        </button>
        <button
          onClick={() => { setActiveTab("avaliacoes"); setShowComparativo(false) }}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === "avaliacoes" ? "border-red-600 text-red-500" : "border-transparent text-zinc-500"
            }`}
        >
          Avaliações Físicas
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
                <Plus size={16} /> Nova Avaliação
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
              Histórico
            </h3>

            {avaliacoes.map((av, index) => (
              <AvaliacaoCard key={av.id} avaliacao={av} isLatest={index === 0} />
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

        {/* Treinos */}
        {activeTab === "treinos" && (
          <WorkoutBuilder
            studentId={student.id}
            workouts={workouts}
            libraryExercises={libraryExercises}
            reviewWorkoutId={reviewWorkoutId}
            onReviewConsumed={() => setReviewWorkoutId(null)}
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

      {/* Delete Confirmation Modal */}
      {showAnamneseModal && (
        <AnamneseModal
          studentId={student.id}
          anamnesis={anamnesis}
          onClose={() => setShowAnamneseModal(false)}
        />
      )}

      {/* Copiloto de Treino: popup de revisao do rascunho da IA */}
      {showAiPopup && aiDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowAiPopup(false)}
          />
          <div className="relative bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
            <button
              onClick={() => setShowAiPopup(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4">
              <Sparkles size={20} className="text-purple-400" />
            </div>
            <h3 className="text-white font-black uppercase text-sm mb-3">
              ✨ Novo Treino Gerado por IA
            </h3>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-5 max-h-60 overflow-y-auto">
              <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-line">
                {aiDraft.ai_notes}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowAiPopup(false)}
                className="border border-zinc-700 text-zinc-300 font-bold uppercase py-3 rounded-xl text-xs hover:bg-zinc-800 transition-colors"
              >
                Depois
              </button>
              <button
                onClick={handleReviewDraft}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black uppercase py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                <Sparkles size={14} /> Revisar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => !deleteLoading && setShowDeleteConfirm(false)}
          />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-white font-black uppercase text-center text-sm mb-2">
              Excluir Aluno
            </h3>
            <p className="text-zinc-400 text-xs text-center leading-relaxed mb-6">
              Tem certeza que deseja excluir <strong className="text-white">{student.full_name}</strong>? Esta ação apagará definitivamente todas as fichas de treino, avaliações, anamnese e o acesso do usuário. Esta ação não pode ser desfeita.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="border border-zinc-700 text-zinc-300 font-bold uppercase py-3 rounded-xl text-xs hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleteLoading ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
