import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hammer Treinamento",
    short_name: "Hammer",
    description: "Plataforma fitness para treinadores e alunos",
    start_url: "/aluno",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ef4444",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
