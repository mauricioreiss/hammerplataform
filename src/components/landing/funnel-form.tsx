"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Activity,
  AlertTriangle,
  FileSignature,
  BrainCircuit,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { registerFromLanding } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import type { Plan } from "@/lib/types";

type FunnelFormProps = {
  plans: Plan[];
  onBack: () => void;
  onComplete: (objetivo: string) => void;
};

const TOTAL_STEPS = 4;

const PAR_Q_QUESTIONS = [
  "Algum médico já disse que você possui problema cardíaco?",
  "Você sente dor no peito durante atividades físicas?",
  "Possui algum problema ósseo, articular ou muscular que possa piorar com exercício?",
  "Faz uso contínuo de medicamentos para pressão arterial ou coração?",
  "Possui diabetes, hipertensão ou colesterol elevado?",
];

const INPUT_CLASS =
  "w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600";

const SELECT_CLASS = INPUT_CLASS + " text-zinc-400";

const CYCLE_LABELS: Record<string, string> = {
  mensal: "Mensal",
  semestral: "Semestral",
  anual: "Anual",
};

export function FunnelForm({ plans, onBack, onComplete }: FunnelFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    idade: "",
    sexo: "",
    peso: "",
    altura: "",
    whatsapp: "",
    objetivo: "",
    experiencia: "",
    diasTreino: "",
    nivelEstresse: "",
    lesoes: "",
    anabolizantes: "",
    planoId: "",
    parq: {} as Record<number, boolean>,
    termo: false,
  });

  function update(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function updateParq(index: number, value: boolean) {
    setFormData((prev) => ({
      ...prev,
      parq: { ...prev.parq, [index]: value },
    }));
  }

  async function handleComplete() {
    setSaving(true);
    setError("");

    const parqData: Record<string, boolean> = {};
    for (const [key, val] of Object.entries(formData.parq)) {
      parqData[`q${key}`] = val;
    }

    const result = await registerFromLanding({
      email: formData.email,
      password: formData.senha,
      name: formData.nome,
      plan_id: formData.planoId,
      objective: formData.objetivo || undefined,
      weight: formData.peso ? Number(formData.peso) : undefined,
      height: formData.altura ? Number(formData.altura) : undefined,
      injuries: formData.lesoes || undefined,
      days_per_week: formData.diasTreino
        ? Number(formData.diasTreino)
        : undefined,
      par_q_data: parqData,
    });

    if (!result.success) {
      setSaving(false);
      setError(result.error ?? "Erro ao salvar cadastro.");
      return;
    }

    // Establish browser session with the credentials just created
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.senha,
    });

    setSaving(false);

    if (signInError) {
      // Registration succeeded but sign-in failed - send to login
      router.push("/login");
      return;
    }

    // Redirect to /aluno - paywall guard will send to /aluno/assinatura
    router.push("/aluno");
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:px-8 pt-8 md:pt-16 pb-24 animate-in slide-in-from-right duration-300">
      <div className="max-w-xl mx-auto">
        {/* Progress header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={step === 1 ? onBack : () => setStep((s) => s - 1)}
            className="text-zinc-500 active:text-white"
          >
            <ChevronLeft size={28} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full w-8 transition-colors ${s <= step ? "bg-red-600" : "bg-zinc-800"}`}
              />
            ))}
          </div>
          <div className="w-7" />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
          {/* Step 1: Personal Data */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2">
                Seus Dados
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                Informações básicas para montarmos seu perfil.
              </p>
              <input
                type="text"
                placeholder="Nome Completo"
                value={formData.nome}
                onChange={(e) => update("nome", e.target.value)}
                className={INPUT_CLASS}
              />
              <input
                type="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
                className={INPUT_CLASS}
              />
              <input
                type="password"
                placeholder="Crie uma senha (min. 6 caracteres)"
                value={formData.senha}
                onChange={(e) => update("senha", e.target.value)}
                className={INPUT_CLASS}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Idade"
                  value={formData.idade}
                  onChange={(e) => update("idade", e.target.value)}
                  className={INPUT_CLASS}
                />
                <select
                  value={formData.sexo}
                  onChange={(e) => update("sexo", e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="">Sexo</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Peso (kg)"
                  value={formData.peso}
                  onChange={(e) => update("peso", e.target.value)}
                  className={INPUT_CLASS}
                />
                <input
                  type="number"
                  placeholder="Altura (cm)"
                  value={formData.altura}
                  onChange={(e) => update("altura", e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <input
                type="tel"
                placeholder="WhatsApp"
                value={formData.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          )}

          {/* Step 2: PAR-Q */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-red-600" size={24} />
                <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">
                  PAR-Q
                </h2>
              </div>
              <p className="text-zinc-400 text-sm mb-6">
                Prontidão para atividade física. Responda com sinceridade.
              </p>
              <div className="space-y-4">
                {PAR_Q_QUESTIONS.map((q, i) => (
                  <div
                    key={i}
                    className="bg-zinc-950 p-4 rounded-xl border border-zinc-800"
                  >
                    <p className="text-sm text-zinc-300 mb-3">{q}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateParq(i, true)}
                        className={`flex-1 py-2 rounded-lg border transition-colors ${
                          formData.parq[i] === true
                            ? "bg-red-600/20 text-red-500 border-red-600"
                            : "border-zinc-700 text-zinc-400 hover:bg-red-600/20 hover:text-red-500 hover:border-red-600"
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => updateParq(i, false)}
                        className={`flex-1 py-2 rounded-lg border transition-colors ${
                          formData.parq[i] === false
                            ? "bg-green-600/20 text-green-500 border-green-600"
                            : "border-zinc-700 text-zinc-400 hover:bg-green-600/20 hover:text-green-500 hover:border-green-600"
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Lifestyle */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2">
                Estilo de Vida
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                Isso ajuda muito no planejamento do treino.
              </p>
              <div className="space-y-3">
                <select
                  value={formData.objetivo}
                  onChange={(e) => update("objetivo", e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="">Objetivo Principal</option>
                  <option value="Hipertrofia">Hipertrofia Extrema</option>
                  <option value="Emagrecimento">Emagrecimento / Secar</option>
                  <option value="Forca">Ganho de Força</option>
                </select>
                <select
                  value={formData.experiencia}
                  onChange={(e) => update("experiencia", e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="">Experiência na Musculação</option>
                  <option value="iniciante">
                    Iniciante (Nunca treinou / Parou)
                  </option>
                  <option value="intermediario">
                    Intermediário (Treina há 1 ano)
                  </option>
                  <option value="avancado">
                    Avançado (Mais de 2 anos intensos)
                  </option>
                </select>
                <select
                  value={formData.diasTreino}
                  onChange={(e) => update("diasTreino", e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="">Quantos dias treina por semana?</option>
                  <option value="3">3 dias</option>
                  <option value="4">4 dias</option>
                  <option value="5">5 dias</option>
                  <option value="6">6 dias</option>
                </select>
                <select
                  value={formData.nivelEstresse}
                  onChange={(e) => update("nivelEstresse", e.target.value)}
                  className={SELECT_CLASS}
                >
                  <option value="">Nível de Estresse / Sono</option>
                  <option value="bom">Durmo bem (7h+) / Estresse Baixo</option>
                  <option value="medio">Durmo OK / Estresse Moderado</option>
                  <option value="ruim">Durmo mal / Estresse Alto</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Final Details + Terms */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-yellow-500" size={24} />
                <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">
                  Detalhes Finais
                </h2>
              </div>

              {/* Plan selection */}
              <div>
                <p className="text-zinc-400 text-sm mb-3">
                  Escolha seu plano de acompanhamento:
                </p>
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => update("planoId", plan.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        formData.planoId === plan.id
                          ? "border-red-600 bg-red-600/10"
                          : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`font-bold text-sm ${formData.planoId === plan.id ? "text-white" : "text-zinc-300"}`}
                          >
                            {plan.name}
                          </p>
                          <p className="text-zinc-500 text-[10px] font-bold uppercase">
                            {CYCLE_LABELS[plan.cycle] ?? plan.cycle}
                          </p>
                        </div>
                        <p
                          className={`text-lg font-black ${formData.planoId === plan.id ? "text-red-500" : "text-zinc-400"}`}
                        >
                          R${" "}
                          {plan.price.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {plans.length === 0 && (
                  <p className="text-zinc-500 text-xs">
                    Nenhum plano disponivel no momento.
                  </p>
                )}
              </div>

              <textarea
                rows={3}
                placeholder="Histórico de lesões, dores atuais ou cirurgias? (Opcional)"
                value={formData.lesoes}
                onChange={(e) => update("lesoes", e.target.value)}
                className={INPUT_CLASS}
              />
              <textarea
                rows={2}
                placeholder="Uso de anabolizantes / peptídeos? (Sigilo absoluto)"
                value={formData.anabolizantes}
                onChange={(e) => update("anabolizantes", e.target.value)}
                className={INPUT_CLASS}
              />
              <div
                className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mt-6 cursor-pointer"
                onClick={() => update("termo", !formData.termo)}
              >
                <div className="flex gap-3 items-start">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${formData.termo ? "bg-red-600" : "border-2 border-zinc-700"}`}
                  >
                    {formData.termo && (
                      <CheckCircle2 size={16} className="text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 font-bold uppercase mb-1 flex items-center gap-2">
                      <FileSignature size={14} /> Termo de Responsabilidade
                    </p>
                    <p className="text-xs text-zinc-500">
                      Declaro que as informações fornecidas são verdadeiras e me
                      responsabilizo por informar qualquer alteração no meu
                      estado de saúde ao Treinador.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs font-bold">{error}</p>
              )}
            </div>
          )}

          {/* Navigation button */}
          <button
            onClick={
              step === TOTAL_STEPS
                ? handleComplete
                : () => setStep((s) => s + 1)
            }
            disabled={
              (step === TOTAL_STEPS &&
                (!formData.termo || !formData.planoId)) ||
              saving
            }
            className={`w-full mt-8 font-black italic uppercase py-5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              (step === TOTAL_STEPS &&
                (!formData.termo || !formData.planoId)) ||
              saving
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
            }`}
          >
            {step === TOTAL_STEPS ? (
              saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  Gerar Avaliação <BrainCircuit size={20} />
                </>
              )
            ) : (
              <>
                Próximo Passo <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
