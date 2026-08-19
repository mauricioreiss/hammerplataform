"use client";

import { useState, useEffect, useRef } from "react";
import { BrainCircuit } from "lucide-react";

type AILoadingProps = {
  objetivo: string;
  onComplete: () => void;
};

export function AILoading({ objetivo, onComplete }: AILoadingProps) {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("Iniciando análise...");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const texts = [
      "Processando Questionário PAR-Q...",
      "Analisando restrições articulares...",
      "Calculando volume ideal de treino...",
      `Estruturando periodização para ${objetivo || "seu objetivo"}...`,
      "Finalizando rascunho de hipertrofia...",
      "Plano pronto para revisão do Treinador!",
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgress((step / texts.length) * 100);
      if (step < texts.length) {
        setText(texts[step]);
      } else {
        clearInterval(interval);
        setTimeout(() => onCompleteRef.current(), 800);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [objetivo]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 animate-in fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full animate-pulse" />
        <div className="w-24 h-24 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin relative z-10" />
        <BrainCircuit
          size={32}
          className="text-red-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <h2 className="text-xl font-black text-white uppercase italic mb-6">
        Inteligência Hammer
      </h2>

      <div className="w-full max-w-xs bg-zinc-900 rounded-full h-2 mb-4 overflow-hidden border border-zinc-800">
        <div
          className="bg-red-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest text-center min-h-5">
        {text}
      </p>
    </div>
  );
}
