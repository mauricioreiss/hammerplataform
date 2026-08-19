"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ImageOff,
  Dumbbell,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  updateIllustrationUrl,
  deleteIllustration,
  type ExerciseRow,
} from "../actions";

type ExerciseEditorProps = {
  exercise: ExerciseRow;
};

export function ExerciseEditor({ exercise }: ExerciseEditorProps) {
  const [illustrationUrl, setIllustrationUrl] = useState(
    exercise.illustration_url,
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Formato invalido. Use PNG, JPG, GIF ou WEBP.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "Arquivo muito grande. Maximo 10MB." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "gif";
      const storagePath = `exercises/${exercise.id}.${ext}`;

      // Upload direct to Supabase Storage from browser
      const { error: uploadError } = await supabase.storage
        .from("exercicios-illustracoes")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        setMessage({
          type: "error",
          text: "Falha no upload: " + uploadError.message,
        });
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("exercicios-illustracoes")
        .getPublicUrl(storagePath);

      // Cache-bust: append timestamp so the browser shows the new image
      const publicUrl = urlData.publicUrl + "?t=" + Date.now();

      // Save URL to database via server action (small payload)
      const result = await updateIllustrationUrl(exercise.id, publicUrl);

      if (result.success) {
        setIllustrationUrl(publicUrl);
        setMessage({ type: "success", text: "Ilustracao atualizada." });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Erro de conexao." });
    }

    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete() {
    setLoading(true);
    setMessage(null);

    const result = await deleteIllustration(exercise.id);

    if (result.success) {
      setIllustrationUrl(null);
      setMessage({ type: "success", text: "Ilustracao removida." });
    } else {
      setMessage({ type: "error", text: result.error });
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 md:px-8 pt-4 pb-4">
        <Link
          href="/admin/exercicios"
          className="text-zinc-400 active:text-white mb-4 flex items-center gap-2 text-xs font-bold uppercase"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>
        <div className="flex items-center gap-2">
          <Dumbbell size={18} className="text-red-600" />
          <h2 className="text-lg font-black italic text-white uppercase tracking-tight">
            {exercise.name}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-black p-4 md:p-6 pb-24 space-y-4">
        {/* Illustration preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="aspect-square bg-zinc-950 relative flex items-center justify-center">
            {illustrationUrl ? (
              <Image
                src={illustrationUrl}
                alt={exercise.name}
                fill
                unoptimized
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="text-center">
                <ImageOff size={48} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-zinc-600 text-xs font-bold uppercase">
                  Sem ilustracao
                </p>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 size={32} className="text-red-600 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Upload / Delete buttons */}
        <div className="flex gap-3">
          <label className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-sm">
            <Upload size={18} />
            {illustrationUrl ? "Trocar" : "Enviar"} Ilustracao
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleUpload}
              className="hidden"
              disabled={loading}
            />
          </label>

          {illustrationUrl && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase py-3 px-4 rounded-xl flex items-center justify-center gap-2 active:bg-zinc-800 transition-colors text-sm disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Status message */}
        {message && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
              message.type === "success"
                ? "bg-green-950/50 border border-green-900 text-green-500"
                : "bg-red-950/50 border border-red-900 text-red-500"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            {message.text}
          </div>
        )}

        {/* Exercise details (read-only) */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-widest mb-3">
            Dados do Exercicio
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                Series
              </p>
              <p className="text-white font-bold">{exercise.sets ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                Reps
              </p>
              <p className="text-white font-bold">{exercise.reps ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                Descanso
              </p>
              <p className="text-white font-bold">{exercise.rest ?? "—"}</p>
            </div>
          </div>
          {exercise.note && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                Observacao
              </p>
              <p className="text-zinc-300 text-xs">{exercise.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
