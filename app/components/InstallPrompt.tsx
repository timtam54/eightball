"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function InstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop" | "unknown">("unknown")
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)
    
    if (isIOS) {
      setDeviceType("ios")
      // iOS doesn't support beforeinstallprompt, show custom prompt
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone
      if (!isInStandaloneMode) {
        setShowInstallPrompt(true)
      }
    } else if (isAndroid) {
      setDeviceType("android")
    } else {
      setDeviceType("desktop")
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deviceType === "ios") {
      // For iOS, we can't trigger install, just show instructions
      return
    }

    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("User accepted the install prompt")
      setShowInstallPrompt(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Set a flag to not show again for some time
    localStorage.setItem("installPromptDismissed", Date.now().toString())
  }

  if (isInstalled || !showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900 border-2 border-blue-500 rounded-lg shadow-2xl p-4 z-50">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white font-bold text-lg">Install EightBall Games</h3>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      
      <p className="text-gray-300 text-sm mb-4">
        Play your favorite games offline and get quick access from your home screen!
      </p>

      {deviceType === "ios" ? (
        <div className="space-y-3">
          <div className="bg-gray-800 rounded p-3 text-sm">
            <p className="text-blue-400 font-semibold mb-2">How to install on iPhone/iPad:</p>
            <ol className="text-gray-300 space-y-1 list-decimal list-inside">
              <li>Tap the share button <span className="inline-block w-4 h-4 align-middle">□↑</span></li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
          </div>
        </div>
      ) : deviceType === "android" ? (
        <div className="space-y-3">
          <button
            onClick={handleInstallClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            Install App
          </button>
          <p className="text-gray-400 text-xs text-center">
            Or use Chrome menu (⋮) → "Add to Home screen"
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleInstallClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            Install App
          </button>
          <p className="text-gray-400 text-xs text-center">
            Install for quick access and offline play
          </p>
        </div>
      )}
    </div>
  )
}