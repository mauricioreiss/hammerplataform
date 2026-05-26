"use client"

import { useState, useCallback } from "react"
import { LandingHero } from "./landing-hero"
import { LandingResults } from "./landing-results"
import { FunnelForm } from "./funnel-form"
import { AILoading } from "./ai-loading"
import { Paywall } from "./paywall"

type Stage = "landing" | "form" | "loading" | "paywall"

export function SalesFunnel() {
  const [stage, setStage] = useState<Stage>("landing")
  const [objetivo, setObjetivo] = useState("")

  const handleFormComplete = useCallback((obj: string) => {
    setObjetivo(obj)
    setStage("loading")
  }, [])

  const handleLoadingComplete = useCallback(() => {
    setStage("paywall")
  }, [])

  return (
    <div className="bg-black min-h-screen selection:bg-red-600 selection:text-white">
      <div className="max-w-md mx-auto bg-zinc-950 min-h-screen shadow-2xl relative overflow-x-hidden">
        {stage === "landing" && (
          <div className="animate-in fade-in duration-500 bg-zinc-950 min-h-screen">
            <LandingHero onStart={() => setStage("form")} />
            <LandingResults />
          </div>
        )}

        {stage === "form" && (
          <FunnelForm
            onBack={() => setStage("landing")}
            onComplete={handleFormComplete}
          />
        )}

        {stage === "loading" && (
          <AILoading
            objetivo={objetivo}
            onComplete={handleLoadingComplete}
          />
        )}

        {stage === "paywall" && <Paywall />}
      </div>
    </div>
  )
}
