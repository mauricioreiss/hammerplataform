"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, Key } from "lucide-react";
import { resetStudentPassword } from "@/app/actions";

type ResetPasswordModalProps = {
  studentId: string;
  studentName: string;
  onClose: () => void;
};

export function ResetPasswordModal({
  studentId,
  studentName,
  onClose,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError("");

    if (password.length < 6) {
      setError("Senha deve ter no minimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    setLoading(true);

    const result = await resetStudentPassword(studentId, password);

    if (!result.success) {
      setError(result.error ?? "Erro ao resetar senha.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(onClose, 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-red-500" />
            <h3 className="text-white font-black italic uppercase text-sm">
              Resetar Senha
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <p className="text-zinc-400 text-xs mb-4">
          Definir nova senha para{" "}
          <strong className="text-white">{studentName}</strong>
        </p>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 size={40} className="text-green-500" />
            <p className="text-green-400 text-sm font-bold">Senha alterada!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 caracteres"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-1">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 mb-4">
                <p className="text-red-500 text-xs font-bold">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase py-3 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Key size={14} />
                )}
                {loading ? "Salvando..." : "Resetar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
