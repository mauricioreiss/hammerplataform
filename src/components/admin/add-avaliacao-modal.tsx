"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Upload, Camera } from "lucide-react";
import { saveAvaliacao, uploadAvaliacaoPhoto } from "@/app/actions";

type Props = {
  studentId: string;
  onClose: () => void;
};

export function AddAvaliacaoModal({ studentId, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    bodyFat: "",
    leanMass: "",
    waist: "",
  });

  async function compressImage(
    file: File,
    maxWidth = 1080,
    quality = 0.8,
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            resolve(
              new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
                type: "image/jpeg",
              }),
            );
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.files?.[0];
    if (!raw) return;
    const compressed = await compressImage(raw);
    setPhotoFile(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let photoUrl: string | undefined;

    if (photoFile) {
      const fd = new FormData();
      fd.append("file", photoFile);
      const uploadResult = await uploadAvaliacaoPhoto(studentId, fd);
      if (!uploadResult.success) {
        setError(uploadResult.error ?? "Erro no upload da foto.");
        setLoading(false);
        return;
      }
      photoUrl = uploadResult.url;
    }

    const result = await saveAvaliacao({
      userId: studentId,
      date: form.date,
      weight: form.weight ? Number(form.weight) : undefined,
      bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
      leanMass: form.leanMass ? Number(form.leanMass) : undefined,
      waist: form.waist ? Number(form.waist) : undefined,
      photoUrl,
    });

    if (!result.success) {
      setError(result.error ?? "Erro ao salvar.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black italic text-white uppercase tracking-tight">
            Nova Avaliacao
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="text-zinc-500 text-[10px] font-bold uppercase block mb-1">
              Data
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Body metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-500 text-[10px] font-bold uppercase block mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="80.5"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-[10px] font-bold uppercase block mb-1">
                % Gordura
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="15.0"
                value={form.bodyFat}
                onChange={(e) => setForm({ ...form, bodyFat: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-[10px] font-bold uppercase block mb-1">
                Massa Magra (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="68.0"
                value={form.leanMass}
                onChange={(e) => setForm({ ...form, leanMass: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-[10px] font-bold uppercase block mb-1">
                Cintura (cm)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="85.0"
                value={form.waist}
                onChange={(e) => setForm({ ...form, waist: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Photo upload */}
          <div>
            <label className="text-zinc-500 text-[10px] font-bold uppercase block mb-2">
              Foto do Aluno (opcional)
            </label>
            {photoPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border border-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl cursor-pointer transition-colors">
                <Camera size={24} className="text-zinc-600 mb-2" />
                <span className="text-zinc-500 text-xs font-bold">
                  Clique para enviar foto
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {loading ? "Salvando..." : "Salvar Avaliacao"}
          </button>
        </form>
      </div>
    </div>
  );
}
