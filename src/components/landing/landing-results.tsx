import Image from "next/image"

const RESULTS = [
  {
    src: "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=400&auto=format&fit=crop",
    label: "-12kg e Definição",
  },
  {
    src: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400&auto=format&fit=crop",
    label: "+8kg Massa Magra",
  },
  {
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop",
    label: "-15% Gordura Corporal",
  },
  {
    src: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=400&auto=format&fit=crop",
    label: "+12kg em 6 Meses",
  },
]

export function LandingResults() {
  return (
    <div className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic mb-8">
        Resultados Reais
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {RESULTS.map((r) => (
          <div
            key={r.label}
            className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800"
          >
            <Image
              src={r.src}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
              alt={`Resultado: ${r.label}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
              <p className="text-white font-bold uppercase text-xs tracking-wider">
                {r.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
