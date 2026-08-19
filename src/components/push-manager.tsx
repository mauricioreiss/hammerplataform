"use client"

import { useEffect, useState } from "react"
import { savePushSubscription, removePushSubscription } from "@/app/actions"
import { Bell, BellOff, Loader2 } from "lucide-react"

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      checkSubscription()
    } else {
      setIsLoading(false)
    }
  }, [])

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (err) {
      console.error("Erro ao checar inscricao de push:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function subscribeToPush() {
    try {
      setIsLoading(true)
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY!),
      })

      const p256dh = subscription.getKey ? Buffer.from(subscription.getKey("p256dh")!).toString("base64") : ""
      const auth = subscription.getKey ? Buffer.from(subscription.getKey("auth")!).toString("base64") : ""

      // Converter o PushSubscription para o formato esperado pelo backend
      const subData = {
        endpoint: subscription.endpoint,
        keys: { p256dh, auth },
      }

      await savePushSubscription(subData)
      setIsSubscribed(true)
    } catch (err) {
      console.error("Falha ao assinar push:", err)
      if (err instanceof Error && err.message.includes("permission")) {
        alert("Voce precisa permitir as notificacoes nas configuracoes do navegador.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribeFromPush() {
    try {
      setIsLoading(true)
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await removePushSubscription(subscription.endpoint)
      }
      setIsSubscribed(false)
    } catch (err) {
      console.error("Falha ao desinscrever do push:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) return null

  return (
    <button
      onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
        isSubscribed
          ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
      }`}
      title={isSubscribed ? "Notificacoes ativadas" : "Ativar notificacoes"}
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isSubscribed ? (
        <Bell size={14} />
      ) : (
        <BellOff size={14} />
      )}
      <span className="hidden sm:inline">
        {isSubscribed ? "Notificacoes ON" : "Ativar Notificacoes"}
      </span>
    </button>
  )
}
