"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { LogOut, Camera, Loader2, X } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { updateAvatarUrl } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import { NotificationPanel } from "@/components/notification-panel";
import { PushManager } from "@/components/push-manager";

type AlunoHeaderProps = {
  initials: string;
  avatarUrl: string | null;
  userId: string;
  hasNotification?: boolean;
  unreadCount: number;
};

export function AlunoHeader({
  initials,
  avatarUrl,
  userId,
  hasNotification,
  unreadCount,
}: AlunoHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) return;

    if (file.size > 5 * 1024 * 1024) return;

    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { contentType: file.type, upsert: true });

      if (upErr) {
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl + "?t=" + Date.now();

      const result = await updateAvatarUrl(publicUrl);
      if (result.success) {
        setCurrentAvatar(publicUrl);
      }
    } catch {
      // silent
    }

    setUploading(false);
    setShowUpload(false);
    setShowMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <header className="bg-zinc-950 border-b border-zinc-800 px-5 h-16 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div className="flex items-center">
          <span className="text-2xl font-black italic tracking-tighter text-white select-none">
            FH
          </span>
        </div>
        <div className="flex items-center gap-3">
          <PushManager />
          <NotificationPanel
            unreadCount={
              hasNotification ? Math.max(unreadCount, 1) : unreadCount
            }
          />

          {/* Avatar - clicavel */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 flex items-center justify-center hover:border-red-600 transition-colors relative"
            >
              {uploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 rounded-full">
                  <Loader2 size={16} className="text-red-500 animate-spin" />
                </div>
              )}
              {currentAvatar ? (
                <Image
                  src={currentAvatar}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xs">{initials}</span>
              )}
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-12 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden w-48 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    setShowUpload(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-xs font-bold uppercase text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                >
                  <Camera size={14} /> Editar Foto
                </button>
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 text-left text-xs font-bold uppercase text-red-500 hover:bg-zinc-800 flex items-center gap-2 transition-colors border-t border-zinc-800"
                  >
                    <LogOut size={14} /> Sair
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overlay para fechar o dropdown */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[9]"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Modal de upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-black italic uppercase text-sm">
                Editar Foto
              </h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 flex items-center justify-center relative">
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 rounded-full">
                    <Loader2 size={24} className="text-red-500 animate-spin" />
                  </div>
                )}
                {currentAvatar ? (
                  <Image
                    src={currentAvatar}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            <label className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform text-sm">
              <Camera size={16} />
              {uploading ? "Enviando..." : "Escolher Foto"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            <p className="text-zinc-600 text-[10px] text-center mt-3 uppercase font-bold">
              PNG, JPG, GIF ou WEBP. Max 5MB.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
