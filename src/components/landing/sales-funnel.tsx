"use client";

import { useState, useCallback } from "react";
import { LandingHero } from "./landing-hero";
import { LandingResults } from "./landing-results";
import { FunnelForm } from "./funnel-form";
import { AILoading } from "./ai-loading";
import { Paywall } from "./paywall";
import type { Plan } from "@/lib/types";

type Stage = "landing" | "form" | "loading" | "paywall";

type SalesFunnelProps = {
  plans: Plan[];
};

export function SalesFunnel({ plans }: SalesFunnelProps) {
  const [stage, setStage] = useState<Stage>("landing");
  const [objetivo, setObjetivo] = useState("");

  const handleFormComplete = useCallback((obj: string) => {
    setObjetivo(obj);
    setStage("loading");
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setStage("paywall");
  }, []);

  return (
    <div className="bg-black min-h-screen selection:bg-red-600 selection:text-white">
      <div className="w-full bg-zinc-950 min-h-screen relative overflow-x-hidden">
        {stage === "landing" && (
          <div className="animate-in fade-in duration-500 bg-zinc-950 min-h-screen">
            <LandingHero onStart={() => setStage("form")} />
            <LandingResults />
          </div>
        )}

        {stage === "form" && (
          <FunnelForm
            plans={plans}
            onBack={() => setStage("landing")}
            onComplete={handleFormComplete}
          />
        )}

        {stage === "loading" && (
          <AILoading objetivo={objetivo} onComplete={handleLoadingComplete} />
        )}

        {stage === "paywall" && <Paywall />}
      </div>
    </div>
  );
}
