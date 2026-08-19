"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BrainCircuit,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { analyzeAnamnese, type AnamneseWithUser } from "../actions";

type AnalysisViewProps = {
  anamnese: AnamneseWithUser;
};

const PAR_Q_LABELS = [
  "Problema cardíaco",
  "Dor no peito",
  "Problema ósseo/articular",
  "Medicamentos pressão/coração",
  "Diabetes/hipertensão/colesterol",
];

export function AnalysisView({ anamnese }: AnalysisViewProps) {
  const [analysis, setAnalysis] = useState<string | null>(
    anamnese.ai_analysis ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);

    const result = await analyzeAnamnese(anamnese.id);

    if (result.success) {
      setAnalysis(result.analysis);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 md:px-8 pt-4 pb-4">
        <Link
          href="/admin/ia"
          className="text-zinc-400 active:text-white mb-4 flex items-center gap-2 text-xs font-bold uppercase"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h2 className="text-lg font-black italic text-white uppercase tracking-tight">
          {anamnese.user_name ?? "Aluno sem cadastro"}
        </h2>
        <p className="text-zinc-500 text-xs mt-1">
          Anamnese de{" "}
          {new Date(anamnese.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-black p-4 md:p-6 pb-24 space-y-4">
        {/* Student Data Summary */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-widest mb-3">
            Dados do Aluno
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                Peso
              </p>
              <p className="text-white font-bold">
                {anamnese.weight ? `${anamnese.weight}kg` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                Altura
              </p>
              <p className="text-white font-bold">
                {anamnese.height ? `${anamnese.height}cm` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                Dias/Semana
              </p>
              <p className="text-white font-bold">
                {anamnese.days_per_week ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                Lesões
              </p>
              <p className="text-white font-bold text-xs">
                {anamnese.injuries || "Nenhuma"}
              </p>
            </div>
          </div>
        </div>

        {/* PAR-Q Summary */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-widest mb-3">
            PAR-Q
          </h3>
          {anamnese.par_q_data ? (
            <div className="space-y-2">
              {Object.entries(anamnese.par_q_data).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300">
                    {PAR_Q_LABELS[Number(key)] ?? `Pergunta ${key}`}
                  </span>
                  {value ? (
                    <span className="text-[9px] bg-red-500/20 text-red-500 border border-red-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                      Sim
                    </span>
                  ) : (
                    <span className="text-[9px] bg-green-500/20 text-green-500 border border-green-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                      Não
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-xs">Não preenchido</p>
          )}
        </div>

        {/* Generate Button */}
        {!analysis && !loading && (
          <button
            onClick={handleAnalyze}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black italic uppercase py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_0_20px_rgba(220,38,38,0.3)]"
          >
            <BrainCircuit size={20} /> Gerar Análise com IA
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center">
            <Loader2
              size={32}
              className="mx-auto mb-4 text-red-600 animate-spin"
            />
            <p className="text-white font-bold uppercase text-sm">
              Analisando com IA...
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              Processando anamnese e gerando rascunho técnico
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-950/50 border border-red-900 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-500" />
              <p className="text-red-500 font-bold text-sm uppercase">Erro</p>
            </div>
            <p className="text-red-400 text-xs">{error}</p>
            <button
              onClick={handleAnalyze}
              className="mt-3 text-red-500 text-xs font-bold uppercase underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Analysis Result */}
        {analysis && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              <p className="text-green-500 font-bold text-xs uppercase">
                Análise concluída
              </p>
            </div>

            <div className="bg-white border border-purple-500 p-5 md:p-6 rounded-xl prose prose-sm max-w-none text-black">
              <div
                dangerouslySetInnerHTML={{
                  __html: formatMarkdown(analysis),
                }}
              />
            </div>

            <button
              onClick={handleAnalyze}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase py-3 rounded-xl text-xs active:bg-zinc-800 transition-colors"
            >
              Gerar Nova Análise
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/### (.+)/g, "<h3>$1</h3>")
    .replace(/## (.+)/g, "<h2>$1</h2>")
    .replace(/# (.+)/g, "<h1>$1</h1>")
    .replace(/^\d+\.\s/gm, "")
    .replace(/^- (.+)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n{2,}/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}
