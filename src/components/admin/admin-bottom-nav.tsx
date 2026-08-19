"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Dumbbell, BrainCircuit } from "lucide-react";

export function AdminBottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/admin";
  const isAlunos = pathname.startsWith("/admin/alunos");
  const isExercicios = pathname.startsWith("/admin/exercicios");
  const isIA = pathname.startsWith("/admin/ia");

  return (
    <nav className="bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 sticky bottom-0 left-0 right-0 z-30 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        <Link
          href="/admin"
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full active:bg-zinc-900 rounded-xl transition-colors"
        >
          <Home
            size={20}
            className={isHome ? "text-red-600" : "text-zinc-500"}
          />
          <span
            className={`text-[8px] uppercase font-bold tracking-wider ${isHome ? "text-red-600" : "text-zinc-500"}`}
          >
            Inicio
          </span>
        </Link>

        <Link
          href="/admin/alunos"
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full active:bg-zinc-900 rounded-xl transition-colors"
        >
          <Users
            size={20}
            className={isAlunos ? "text-red-600" : "text-zinc-500"}
          />
          <span
            className={`text-[8px] uppercase font-bold tracking-wider ${isAlunos ? "text-red-600" : "text-zinc-500"}`}
          >
            Alunos
          </span>
        </Link>

        <Link
          href="/admin/exercicios"
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full active:bg-zinc-900 rounded-xl transition-colors"
        >
          <Dumbbell
            size={20}
            className={isExercicios ? "text-red-600" : "text-zinc-500"}
          />
          <span
            className={`text-[8px] uppercase font-bold tracking-wider ${isExercicios ? "text-red-600" : "text-zinc-500"}`}
          >
            Exercicios
          </span>
        </Link>

        <Link
          href="/admin/ia"
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full active:bg-zinc-900 rounded-xl transition-colors"
        >
          <BrainCircuit
            size={20}
            className={isIA ? "text-red-600" : "text-zinc-500"}
          />
          <span
            className={`text-[8px] uppercase font-bold tracking-wider ${isIA ? "text-red-600" : "text-zinc-500"}`}
          >
            IA Maker
          </span>
        </Link>
      </div>
    </nav>
  );
}
