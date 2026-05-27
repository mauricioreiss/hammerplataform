"use client"

import { useState, useEffect } from "react"
import { Download, X, Share } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) return

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem("pwa-dismissed")
    if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return

    // Android/Chrome: listen for beforeinstallprompt
    function handlePrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handlePrompt)

    // iOS Safari detection
    const ua = navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)
    if (isIos && isSafari) {
      setShowIosHint(true)
    }

    return () => window.removeEventListener("beforeinstallprompt", handlePrompt)
  }, [])

  function dismiss() {
    setDismissed(true)
    setDeferredPrompt(null)
    setShowIosHint(false)
    localStorage.setItem("pwa-dismissed", String(Date.now()))
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setDeferredPrompt(null)
    }
  }

  if (dismissed) return null
  if (!deferredPrompt && !showIosHint) return null

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center shrink-0">
            <Download size={20} className="text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold">Instalar App</p>
            {showIosHint ? (
              <p className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1">
                Toque em <Share size={12} className="text-blue-400 inline" /> e depois &quot;Adicionar a Tela de Inicio&quot;
              </p>
            ) : (
              <p className="text-zinc-400 text-xs mt-0.5">
                Acesse direto da tela inicial
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase px-3 py-2 rounded-lg transition-colors active:scale-95"
            >
              Instalar
            </button>
          )}
          <button
            onClick={dismiss}
            className="text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
