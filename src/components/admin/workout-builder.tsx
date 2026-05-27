"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
  Dumbbell,
  X,
  BrainCircuit,
  GripVertical,
  Save,
} from "lucide-react"
import type { Workout, Exercise } from "@/lib/types"
import {
  createWorkoutWithExercises,
  removeExerciseFromWorkout,
  updateWorkoutStatus,
  deleteWorkout,
} from "@/app/actions"

// --- Types ---

type ExerciseDraft = {
  key: number
  name: string
  muscleGroup: string
  sets: string
  reps: string
  rest: string
  note: string
  illustrationUrl: string
}

type WorkoutBuilderProps = {
  studentId: string
  workouts: Workout[]
  libraryExercises: Exercise[]
}

// --- Main Component ---

export function WorkoutBuilder({
  studentId,
  workouts,
  libraryExercises,
}: WorkoutBuilderProps) {
  const [showModal, setShowModal] = useState(false)
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(
    workouts[0]?.id ?? null,
  )

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-[0_0_20px_rgba(220,38,38,0.25)]"
        >
          <Plus size={18} /> Criar Nova Ficha
        </button>
        <button
          onClick={() => alert("Gerador de treinos com IA em desenvolvimento.")}
          className="bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-300 font-bold uppercase py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
        >
          <BrainCircuit size={18} className="text-purple-400" />
          <span className="hidden sm:inline">Gerar com IA</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <WorkoutCreatorModal
          studentId={studentId}
          libraryExercises={libraryExercises}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Existing Workouts */}
      {workouts.length === 0 && (
        <div className="text-center text-zinc-500 pt-10 pb-6">
          <FileText size={48} className="mx-auto mb-4 opacity-40" />
          <p className="uppercase font-bold text-sm text-zinc-400">
            Nenhuma ficha de treino
          </p>
          <p className="text-[11px] text-zinc-600 mt-1">
            Crie a primeira ficha de treino para este aluno.
          </p>
        </div>
      )}

      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          expanded={expandedWorkout === workout.id}
          onToggle={() =>
            setExpandedWorkout(
              expandedWorkout === workout.id ? null : workout.id,
            )
          }
        />
      ))}
    </div>
  )
}

// --- Workout Creator Modal ---

function WorkoutCreatorModal({
  studentId,
  libraryExercises,
  onClose,
}: {
  studentId: string
  libraryExercises: Exercise[]
  onClose: () => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [exercises, setExercises] = useState<ExerciseDraft[]>([
    makeEmptyExercise(1),
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const nextKey = useRef(2)

  function addExercise() {
    setExercises((prev) => [...prev, makeEmptyExercise(nextKey.current++)])
  }

  function removeExercise(key: number) {
    setExercises((prev) => prev.filter((ex) => ex.key !== key))
  }

  function updateExercise(key: number, field: keyof ExerciseDraft, value: string) {
    setExercises((prev) =>
      prev.map((ex) => (ex.key === key ? { ...ex, [field]: value } : ex)),
    )
  }

  function selectLibraryExercise(key: number, libEx: Exercise) {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.key === key
          ? {
              ...ex,
              name: libEx.name,
              muscleGroup: libEx.muscle_group ?? "",
              illustrationUrl: libEx.illustration_url ?? "",
            }
          : ex,
      ),
    )
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Informe o titulo da ficha.")
      return
    }

    const valid = exercises.filter((ex) => ex.name.trim())
    if (valid.length === 0) {
      setError("Adicione pelo menos um exercicio.")
      return
    }

    setLoading(true)
    setError("")

    const result = await createWorkoutWithExercises(
      studentId,
      title,
      valid.map((ex) => ({
        name: ex.name.trim(),
        muscleGroup: ex.muscleGroup,
        sets: ex.sets || "3",
        reps: ex.reps || "12",
        rest: ex.rest || "60s",
        note: ex.note || undefined,
        illustrationUrl: ex.illustrationUrl || undefined,
      })),
    )

    if (!result.success) {
      setError(result.error ?? "Erro ao salvar ficha.")
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Dumbbell size={20} className="text-red-500" />
          <h2 className="text-base font-black text-white uppercase tracking-tight">
            Construtor de Treino
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white p-1 transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-2">
            Titulo da Ficha
          </label>
          <input
            type="text"
            placeholder="Ex: Treino A - Peito e Triceps"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              Exercicios ({exercises.length})
            </label>
            <button
              type="button"
              onClick={addExercise}
              className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <Plus size={12} /> Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {exercises.map((ex, idx) => (
              <ExerciseRow
                key={ex.key}
                index={idx + 1}
                draft={ex}
                libraryExercises={libraryExercises}
                onUpdate={(field, value) => updateExercise(ex.key, field, value)}
                onSelectLibrary={(libEx) => selectLibraryExercise(ex.key, libEx)}
                onRemove={() => removeExercise(ex.key)}
                canRemove={exercises.length > 1}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addExercise}
            className="w-full mt-3 border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl py-3 text-zinc-500 hover:text-zinc-300 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={14} /> Adicionar Exercicio
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-500 text-xs font-bold">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-zinc-900 border-t border-zinc-800 px-4 md:px-6 py-4 flex gap-3 shrink-0">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase py-3.5 rounded-xl text-xs active:scale-[0.97] transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(220,38,38,0.25)]"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {loading ? "Salvando..." : "Salvar Ficha Completa"}
        </button>
      </div>
    </div>
  )
}

// --- Exercise Row ---

function ExerciseRow({
  index,
  draft,
  libraryExercises,
  onUpdate,
  onSelectLibrary,
  onRemove,
  canRemove,
}: {
  index: number
  draft: ExerciseDraft
  libraryExercises: Exercise[]
  onUpdate: (field: keyof ExerciseDraft, value: string) => void
  onSelectLibrary: (ex: Exercise) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = draft.name.length >= 2
    ? libraryExercises.filter(
        (ex) =>
          ex.name.toLowerCase().includes(draft.name.toLowerCase()) ||
          (ex.muscle_group ?? "").toLowerCase().includes(draft.name.toLowerCase()),
      )
    : []

  function handleSelectSuggestion(ex: Exercise) {
    onSelectLibrary(ex)
    setShowSuggestions(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-zinc-700" />
          <span className="text-zinc-500 text-[10px] font-bold uppercase">
            Exercicio {index}
          </span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-zinc-600 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Exercise name with autocomplete */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Nome do exercicio (digite para buscar)"
          value={draft.name}
          onChange={(e) => {
            onUpdate("name", e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-40 overflow-y-auto">
            {suggestions.slice(0, 8).map((ex) => (
              <button
                key={ex.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectSuggestion(ex)}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
              >
                <Dumbbell size={12} className="text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold truncate">
                    {ex.name}
                  </p>
                  <p className="text-zinc-500 text-[9px]">
                    {ex.muscle_group ?? ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Muscle group (auto-filled from library or manual) */}
      <select
        value={draft.muscleGroup}
        onChange={(e) => onUpdate("muscleGroup", e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-400 focus:outline-none focus:border-red-600 transition-colors"
      >
        <option value="">Grupo Muscular</option>
        <option value="Peito">Peito</option>
        <option value="Costas">Costas</option>
        <option value="Ombros">Ombros</option>
        <option value="Biceps">Biceps</option>
        <option value="Triceps">Triceps</option>
        <option value="Pernas">Pernas</option>
        <option value="Posterior">Posterior</option>
        <option value="Gluteos">Gluteos</option>
        <option value="Abdomen">Abdomen</option>
      </select>

      {/* Sets / Reps / Rest */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-zinc-600 text-[9px] font-bold uppercase block mb-1">
            Series
          </label>
          <input
            type="text"
            value={draft.sets}
            onChange={(e) => onUpdate("sets", e.target.value)}
            placeholder="4"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white text-center placeholder:text-zinc-700 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div>
          <label className="text-zinc-600 text-[9px] font-bold uppercase block mb-1">
            Reps
          </label>
          <input
            type="text"
            value={draft.reps}
            onChange={(e) => onUpdate("reps", e.target.value)}
            placeholder="10-12"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white text-center placeholder:text-zinc-700 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
        <div>
          <label className="text-zinc-600 text-[9px] font-bold uppercase block mb-1">
            Descanso
          </label>
          <input
            type="text"
            value={draft.rest}
            onChange={(e) => onUpdate("rest", e.target.value)}
            placeholder="60s"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white text-center placeholder:text-zinc-700 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
      </div>

      {/* Note */}
      <input
        type="text"
        placeholder="Observacao (opcional)"
        value={draft.note}
        onChange={(e) => onUpdate("note", e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600 transition-colors"
      />
    </div>
  )
}

// --- Workout Card (existing workouts) ---

function WorkoutCard({
  workout,
  expanded,
  onToggle,
}: {
  workout: Workout
  expanded: boolean
  onToggle: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const exercises = workout.exercises ?? []
  const isApproved = workout.status === "approved"

  function handleStatusToggle() {
    const newStatus = isApproved ? "draft" : "approved"
    startTransition(async () => {
      await updateWorkoutStatus(workout.id, newStatus)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm("Excluir esta ficha de treino e todos seus exercicios?")) return
    startTransition(async () => {
      await deleteWorkout(workout.id)
      router.refresh()
    })
  }

  function handleRemoveExercise(exerciseId: string) {
    startTransition(async () => {
      await removeExerciseFromWorkout(exerciseId)
      router.refresh()
    })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <FileText
            size={18}
            className={isApproved ? "text-green-500" : "text-yellow-500"}
          />
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate">
              {workout.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                  isApproved
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {isApproved ? "Aprovado" : "Rascunho"}
              </span>
              <span className="text-[10px] text-zinc-600">
                {exercises.length} exercicio{exercises.length !== 1 && "s"}
              </span>
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-zinc-500 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-zinc-500 shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-zinc-800 px-4 py-3 space-y-3">
          {/* Action bar */}
          <div className="flex gap-2">
            <button
              onClick={handleStatusToggle}
              disabled={isPending}
              className={`flex-1 text-[10px] font-bold uppercase py-2.5 rounded-lg flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all ${
                isApproved
                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                  : "bg-green-500/10 text-green-400 border border-green-500/30"
              }`}
            >
              <CheckCircle2 size={13} />
              {isApproved ? "Voltar p/ Rascunho" : "Aprovar Ficha"}
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="bg-zinc-800 hover:bg-zinc-700 text-red-500 text-[10px] font-bold uppercase px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 active:scale-[0.97] transition-all"
            >
              <Trash2 size={13} /> Excluir
            </button>
          </div>

          {/* Exercises list */}
          {exercises.length === 0 && (
            <p className="text-zinc-600 text-[10px] text-center py-4 italic">
              Nenhum exercicio nesta ficha.
            </p>
          )}

          {exercises.map((ex, idx) => (
            <div
              key={ex.id}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-zinc-500 text-[10px] font-bold">
                  {idx + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">
                  {ex.name}
                </p>
                <p className="text-zinc-500 text-[10px] mt-0.5">
                  {ex.muscle_group ?? ""}{ex.muscle_group ? " \u00B7 " : ""}
                  {ex.sets ?? "—"}x{ex.reps ?? "—"} \u00B7{" "}
                  {ex.rest ?? "—"} descanso
                </p>
                {ex.note && (
                  <p className="text-zinc-600 text-[10px] mt-1 italic">
                    {ex.note}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveExercise(ex.id)}
                disabled={isPending}
                className="text-zinc-700 hover:text-red-500 transition-colors shrink-0 mt-1 p-0.5"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {isPending && (
            <div className="flex items-center justify-center py-2">
              <Loader2 size={16} className="animate-spin text-zinc-500" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Helpers ---

function makeEmptyExercise(key: number): ExerciseDraft {
  return {
    key,
    name: "",
    muscleGroup: "",
    sets: "",
    reps: "",
    rest: "",
    note: "",
    illustrationUrl: "",
  }
}
