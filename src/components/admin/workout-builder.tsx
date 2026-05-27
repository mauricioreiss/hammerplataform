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
  Pencil,
} from "lucide-react"
import type { Workout, Exercise } from "@/lib/types"
import {
  createWorkoutWithExercises,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  updateWorkoutStatus,
  updateWorkoutTitle,
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
  const [aiLoading, setAiLoading] = useState(false)
  const router = useRouter()

  async function handleGenerateAI() {
    setAiLoading(true)
    try {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: studentId }),
      })
      const data = await res.json()
      if (!data.success) {
        alert(data.error ?? "Erro ao gerar treino com IA.")
      } else {
        router.refresh()
      }
    } catch {
      alert("Erro de conexao ao gerar treino.")
    } finally {
      setAiLoading(false)
    }
  }

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
          onClick={handleGenerateAI}
          disabled={aiLoading}
          className="bg-zinc-900 border border-zinc-700 hover:border-zinc-600 text-zinc-300 font-bold uppercase py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
        >
          {aiLoading ? (
            <Loader2 size={18} className="animate-spin text-purple-400" />
          ) : (
            <BrainCircuit size={18} className="text-purple-400" />
          )}
          <span className="hidden sm:inline">{aiLoading ? "Gerando..." : "Gerar com IA"}</span>
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
            Crie a primeira ficha ou gere automaticamente com IA.
          </p>
        </div>
      )}

      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          libraryExercises={libraryExercises}
          expanded={expandedWorkout === workout.id}
          onToggle={() =>
            setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)
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
  const [exercises, setExercises] = useState<ExerciseDraft[]>([makeEmptyExercise(1)])
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
          ? { ...ex, name: libEx.name, muscleGroup: libEx.muscle_group ?? "", illustrationUrl: libEx.illustration_url ?? "" }
          : ex,
      ),
    )
  }

  async function handleSave() {
    if (!title.trim()) { setError("Informe o titulo da ficha."); return }
    const valid = exercises.filter((ex) => ex.name.trim())
    if (valid.length === 0) { setError("Adicione pelo menos um exercicio."); return }

    setLoading(true)
    setError("")

    const result = await createWorkoutWithExercises(
      studentId, title,
      valid.map((ex) => ({
        name: ex.name.trim(), muscleGroup: ex.muscleGroup,
        sets: ex.sets || "3", reps: ex.reps || "12", rest: ex.rest || "60s",
        note: ex.note || undefined, illustrationUrl: ex.illustrationUrl || undefined,
      })),
    )

    if (!result.success) { setError(result.error ?? "Erro ao salvar ficha."); setLoading(false); return }
    setLoading(false)
    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Dumbbell size={20} className="text-red-500" />
          <h2 className="text-base font-black text-white uppercase tracking-tight">Construtor de Treino</h2>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white p-1"><X size={22} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        <div>
          <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-2">Titulo da Ficha</label>
          <input type="text" placeholder="Ex: Treino A - Peito e Triceps" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Exercicios ({exercises.length})</label>
            <button type="button" onClick={addExercise} className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 hover:text-red-400">
              <Plus size={12} /> Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {exercises.map((ex, idx) => (
              <ExerciseRow key={ex.key} index={idx + 1} draft={ex} libraryExercises={libraryExercises}
                onUpdate={(field, value) => updateExercise(ex.key, field, value)}
                onSelectLibrary={(libEx) => selectLibraryExercise(ex.key, libEx)}
                onRemove={() => removeExercise(ex.key)} canRemove={exercises.length > 1} />
            ))}
          </div>
          <button type="button" onClick={addExercise}
            className="w-full mt-3 border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl py-3 text-zinc-500 hover:text-zinc-300 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors">
            <Plus size={14} /> Adicionar Exercicio
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-500 text-xs font-bold">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border-t border-zinc-800 px-4 md:px-6 py-4 flex gap-3 shrink-0">
        <button onClick={onClose} disabled={loading} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase py-3.5 rounded-xl text-xs">Cancelar</button>
        <button onClick={handleSave} disabled={loading}
          className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(220,38,38,0.25)]">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? "Salvando..." : "Salvar Ficha Completa"}
        </button>
      </div>
    </div>
  )
}

// --- Exercise Row ---

function ExerciseRow({ index, draft, libraryExercises, onUpdate, onSelectLibrary, onRemove, canRemove }: {
  index: number; draft: ExerciseDraft; libraryExercises: Exercise[]
  onUpdate: (field: keyof ExerciseDraft, value: string) => void
  onSelectLibrary: (ex: Exercise) => void; onRemove: () => void; canRemove: boolean
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = draft.name.length >= 2
    ? libraryExercises.filter((ex) =>
        ex.name.toLowerCase().includes(draft.name.toLowerCase()) ||
        (ex.muscle_group ?? "").toLowerCase().includes(draft.name.toLowerCase()))
    : []

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-zinc-700" />
          <span className="text-zinc-500 text-[10px] font-bold uppercase">Exercicio {index}</span>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} className="text-zinc-600 hover:text-red-500 p-1"><Trash2 size={14} /></button>
        )}
      </div>

      <div className="relative">
        <input type="text" placeholder="Nome do exercicio (digite para buscar)" value={draft.name}
          onChange={(e) => { onUpdate("name", e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600" />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-40 overflow-y-auto">
            {suggestions.slice(0, 8).map((ex) => (
              <button key={ex.id} type="button" onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onSelectLibrary(ex); setShowSuggestions(false) }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-800 border-b border-zinc-800 last:border-0">
                <Dumbbell size={12} className="text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold truncate">{ex.name}</p>
                  <p className="text-zinc-500 text-[9px]">{ex.muscle_group ?? ""}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <select value={draft.muscleGroup} onChange={(e) => onUpdate("muscleGroup", e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-400 focus:outline-none focus:border-red-600">
        <option value="">Grupo Muscular</option>
        {["Peito","Costas","Ombros","Biceps","Triceps","Pernas","Posterior","Gluteos","Abdomen"].map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Series", field: "sets" as const, ph: "4" },
          { label: "Reps", field: "reps" as const, ph: "10-12" },
          { label: "Descanso", field: "rest" as const, ph: "60s" },
        ].map(({ label, field, ph }) => (
          <div key={field}>
            <label className="text-zinc-600 text-[9px] font-bold uppercase block mb-1">{label}</label>
            <input type="text" value={draft[field]} onChange={(e) => onUpdate(field, e.target.value)} placeholder={ph}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white text-center placeholder:text-zinc-700 focus:outline-none focus:border-red-600" />
          </div>
        ))}
      </div>

      <input type="text" placeholder="Observacao (opcional)" value={draft.note} onChange={(e) => onUpdate("note", e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600" />
    </div>
  )
}

// --- Workout Card ---

function WorkoutCard({ workout, libraryExercises, expanded, onToggle }: {
  workout: Workout; libraryExercises: Exercise[]; expanded: boolean; onToggle: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(workout.title)
  const [showAddExercise, setShowAddExercise] = useState(false)

  const exercises = workout.exercises ?? []
  const isPublished = workout.status === "published" || workout.status === "approved"

  function handleStatusToggle() {
    startTransition(async () => {
      await updateWorkoutStatus(workout.id, isPublished ? "draft" : "published")
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm("Excluir esta ficha e todos seus exercicios?")) return
    startTransition(async () => { await deleteWorkout(workout.id); router.refresh() })
  }

  function handleRemoveExercise(id: string) {
    startTransition(async () => { await removeExerciseFromWorkout(id); router.refresh() })
  }

  function handleSaveTitle() {
    if (!titleDraft.trim()) return
    startTransition(async () => { await updateWorkoutTitle(workout.id, titleDraft); setEditingTitle(false); router.refresh() })
  }

  function handleAddExercise(ex: Exercise, sets: string, reps: string, rest: string, note: string) {
    startTransition(async () => {
      await addExerciseToWorkout(workout.id, {
        name: ex.name, muscleGroup: ex.muscle_group ?? "", sets, reps, rest,
        note: note || undefined, illustrationUrl: ex.illustration_url || undefined,
      })
      setShowAddExercise(false)
      router.refresh()
    })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full px-4 py-3.5 flex items-center justify-between text-left">
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={18} className={isPublished ? "text-green-500" : "text-yellow-500"} />
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate">{workout.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                {isPublished ? "Publicado" : "Rascunho"}
              </span>
              {workout.is_ai_draft && <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-purple-500/20 text-purple-400">IA</span>}
              <span className="text-[10px] text-zinc-600">{exercises.length} exercicio{exercises.length !== 1 && "s"}</span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-zinc-500 shrink-0" /> : <ChevronDown size={16} className="text-zinc-500 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 px-4 py-3 space-y-3">
          {/* Edit title */}
          {editingTitle ? (
            <div className="flex gap-2">
              <input type="text" value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} autoFocus
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600" />
              <button onClick={handleSaveTitle} disabled={isPending} className="bg-red-600 text-white text-[10px] font-bold px-3 rounded-lg">Salvar</button>
              <button onClick={() => { setEditingTitle(false); setTitleDraft(workout.title) }} className="text-zinc-500 text-[10px] font-bold px-2">X</button>
            </div>
          ) : null}

          {/* Action bar */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setEditingTitle(true)} disabled={isPending}
              className="bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase py-2.5 px-3 rounded-lg flex items-center gap-1.5 active:scale-[0.97]">
              <Pencil size={12} /> Editar
            </button>
            <button onClick={() => setShowAddExercise(!showAddExercise)} disabled={isPending}
              className="bg-zinc-800 text-white text-[10px] font-bold uppercase py-2.5 px-3 rounded-lg flex items-center gap-1.5 active:scale-[0.97]">
              <Plus size={12} /> Exercicio
            </button>
            <button onClick={handleStatusToggle} disabled={isPending}
              className={`text-[10px] font-bold uppercase py-2.5 px-3 rounded-lg flex items-center gap-1.5 active:scale-[0.97] ${
                isPublished ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30" : "bg-green-500/10 text-green-400 border border-green-500/30"}`}>
              <CheckCircle2 size={12} /> {isPublished ? "Rascunho" : "Publicar"}
            </button>
            <button onClick={handleDelete} disabled={isPending}
              className="bg-zinc-800 text-red-500 text-[10px] font-bold uppercase px-3 py-2.5 rounded-lg flex items-center gap-1.5 active:scale-[0.97]">
              <Trash2 size={12} />
            </button>
          </div>

          {/* Inline add exercise */}
          {showAddExercise && (
            <InlineAddExercise libraryExercises={libraryExercises} onAdd={handleAddExercise} onClose={() => setShowAddExercise(false)} />
          )}

          {/* Exercises list */}
          {exercises.length === 0 && !showAddExercise && (
            <p className="text-zinc-600 text-[10px] text-center py-4 italic">Nenhum exercicio nesta ficha.</p>
          )}

          {exercises.map((ex, idx) => (
            <div key={ex.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-zinc-500 text-[10px] font-bold">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{ex.name}</p>
                <p className="text-zinc-500 text-[10px] mt-0.5">
                  {ex.muscle_group ? `${ex.muscle_group} \u00B7 ` : ""}{ex.sets ?? "—"}x{ex.reps ?? "—"} \u00B7 {ex.rest ?? "—"} descanso
                </p>
                {ex.note && <p className="text-zinc-600 text-[10px] mt-1 italic">{ex.note}</p>}
              </div>
              <button onClick={() => handleRemoveExercise(ex.id)} disabled={isPending}
                className="text-zinc-700 hover:text-red-500 shrink-0 mt-1 p-0.5"><Trash2 size={13} /></button>
            </div>
          ))}

          {isPending && <div className="flex justify-center py-2"><Loader2 size={16} className="animate-spin text-zinc-500" /></div>}
        </div>
      )}
    </div>
  )
}

// --- Inline Add Exercise (for editing existing workout) ---

function InlineAddExercise({ libraryExercises, onAdd, onClose }: {
  libraryExercises: Exercise[]
  onAdd: (ex: Exercise, sets: string, reps: string, rest: string, note: string) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Exercise | null>(null)
  const [sets, setSets] = useState("3")
  const [reps, setReps] = useState("12")
  const [rest, setRest] = useState("60s")
  const [note, setNote] = useState("")

  const filtered = search.length >= 2
    ? libraryExercises.filter((ex) =>
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        (ex.muscle_group ?? "").toLowerCase().includes(search.toLowerCase()))
    : libraryExercises

  if (!selected) {
    return (
      <div className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-white text-[10px] font-bold uppercase">Selecionar Exercicio</p>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={14} /></button>
        </div>
        <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600" />
        <div className="max-h-40 overflow-y-auto space-y-1">
          {filtered.slice(0, 10).map((ex) => (
            <button key={ex.id} onClick={() => setSelected(ex)}
              className="w-full text-left bg-zinc-900 hover:bg-zinc-800 rounded-lg px-3 py-2 flex items-center gap-2">
              <Dumbbell size={12} className="text-red-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">{ex.name}</p>
                <p className="text-zinc-500 text-[9px]">{ex.muscle_group ?? ""}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-950 border border-zinc-700 rounded-xl p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={14} className="text-red-500" />
          <p className="text-white text-xs font-bold">{selected.name}</p>
        </div>
        <button onClick={() => setSelected(null)} className="text-zinc-500 text-[10px] uppercase font-bold">Trocar</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-zinc-600 text-[9px] font-bold uppercase block mb-1">Series</label>
          <input type="text" value={sets} onChange={(e) => setSets(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white text-center focus:outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="text-zinc-600 text-[9px] font-bold uppercase block mb-1">Reps</label>
          <input type="text" value={reps} onChange={(e) => setReps(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white text-center focus:outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="text-zinc-600 text-[9px] font-bold uppercase block mb-1">Descanso</label>
          <input type="text" value={rest} onChange={(e) => setRest(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white text-center focus:outline-none focus:border-red-600" />
        </div>
      </div>
      <input type="text" placeholder="Observacao (opcional)" value={note} onChange={(e) => setNote(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600" />
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase py-2 rounded-lg">Cancelar</button>
        <button onClick={() => onAdd(selected, sets, reps, rest, note)}
          className="flex-1 bg-red-600 text-white text-[10px] font-bold uppercase py-2 rounded-lg flex items-center justify-center gap-1">
          <Plus size={12} /> Adicionar
        </button>
      </div>
    </div>
  )
}

// --- Helpers ---

function makeEmptyExercise(key: number): ExerciseDraft {
  return { key, name: "", muscleGroup: "", sets: "", reps: "", rest: "", note: "", illustrationUrl: "" }
}
