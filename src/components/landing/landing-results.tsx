export function LandingResults() {
  return (
    <div className="py-16 px-4 max-w-3xl mx-auto text-center">
      <h2 className="text-2xl font-black text-white uppercase italic mb-8">
        Resultados Reais
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=400&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Resultado: -12kg e definição"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
            <p className="text-white font-bold uppercase text-xs tracking-wider">
              -12kg e Definição
            </p>
          </div>
        </div>
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Resultado: +8kg massa magra"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
            <p className="text-white font-bold uppercase text-xs tracking-wider">
              +8kg Massa Magra
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
