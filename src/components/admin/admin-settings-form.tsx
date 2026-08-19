"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Save, CheckCircle2, Trash2 } from "lucide-react";
import {
  updateAdminProfile,
  uploadAvatarPhoto,
  removeAvatarPhoto,
} from "@/app/actions";
import type { UserProfile } from "@/lib/types";

type AdminSettingsFormProps = {
  user: UserProfile;
};

export function AdminSettingsForm({ user }: AdminSettingsFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user.full_name);
  const [pixKey, setPixKey] = useState(user.pix_key ?? "");
  const [currentAvatar, setCurrentAvatar] = useState(user.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file);

      const result = await uploadAvatarPhoto(fd);
      if (!result.success) {
        setError(result.error ?? "Erro ao enviar foto.");
      } else if (result.url) {
        setCurrentAvatar(result.url);
        router.refresh();
      }
    } catch {
      setError("Erro ao enviar foto.");
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemovePhoto() {
    setUploading(true);
    setError("");

    const result = await removeAvatarPhoto();
    if (result.success) {
      setCurrentAvatar(null);
      router.refresh();
    } else {
      setError(result.error ?? "Erro ao remover foto.");
    }

    setUploading(false);
  }

  async function handleSave() {
    if (!fullName.trim()) {
      setError("Nome e obrigatorio.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    const result = await updateAdminProfile({
      fullName: fullName.trim(),
      avatarUrl: currentAvatar ?? undefined,
      pixKey: pixKey.trim(),
    });

    if (!result.success) {
      setError(result.error ?? "Erro ao salvar.");
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  }

  const initials = fullName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-lg space-y-6">
      {/* Avatar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-4">
          Foto de Perfil
        </label>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 flex items-center justify-center relative shrink-0">
            {uploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 rounded-full">
                <Loader2 size={20} className="text-red-500 animate-spin" />
              </div>
            )}
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt="Avatar"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xl">{initials}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer active:scale-95 transition-transform text-xs">
              <Camera size={14} />
              {uploading ? "Enviando..." : "Alterar Foto"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {currentAvatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={uploading}
                className="bg-zinc-800/80 hover:bg-red-600/20 hover:text-red-400 text-zinc-400 font-bold uppercase py-2.5 px-3 rounded-xl flex items-center gap-1.5 active:scale-95 transition-all text-xs border border-zinc-700/50"
              >
                <Trash2 size={14} />
                Remover Foto
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-2">
          Nome Completo
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      {/* PIX Key */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest block mb-2">
          Chave PIX
        </label>
        <input
          type="text"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          placeholder="CPF, e-mail, telefone ou chave aleatoria"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
        />
        <p className="text-zinc-600 text-[10px] mt-2">
          Essa chave aparece na tela de pagamento dos alunos.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <p className="text-red-500 text-xs font-bold">{error}</p>
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving || uploading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50 text-sm shadow-[0_0_20px_rgba(220,38,38,0.25)]"
      >
        {saving ? (
          <Loader2 size={16} className="animate-spin" />
        ) : saved ? (
          <CheckCircle2 size={16} />
        ) : (
          <Save size={16} />
        )}
        {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Configuracoes"}
      </button>
    </div>
  );
}
