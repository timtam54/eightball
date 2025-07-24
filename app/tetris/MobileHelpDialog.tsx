"use client"

import { useEffect } from "react"

interface MobileHelpDialogProps {
  isOpen: boolean
  onClose: () => void
  skin: {
    uiBackground: string
    uiBorder: string
    uiText: string
    uiAccent: string
    buttonStyle: string
    fontFamily: string
  }
}

export default function MobileHelpDialog({ isOpen, onClose, skin }: MobileHelpDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className={`relative ${skin.uiBackground} ${skin.uiBorder} p-6 max-w-md w-full rounded-lg shadow-2xl`}
        style={{ fontFamily: skin.fontFamily }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 ${skin.uiText} hover:opacity-70 transition-opacity text-2xl`}
          aria-label="Close help dialog"
        >
          ×
        </button>

        <h2 className={`text-2xl font-bold mb-4 ${skin.uiAccent}`}>
          Mobile Controls
        </h2>

        <div className={`space-y-4 ${skin.uiText}`}>
          <div className="border-b border-gray-600 pb-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-blue-400">👆</span> Swipe Controls
            </h3>
            <p className="text-sm opacity-90">
              Control your pieces using intuitive swipe gestures:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600/30 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400">←</span>
              </div>
              <div>
                <h4 className="font-semibold">Swipe Left</h4>
                <p className="text-sm opacity-80">Move piece left</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600/30 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400">→</span>
              </div>
              <div>
                <h4 className="font-semibold">Swipe Right</h4>
                <p className="text-sm opacity-80">Move piece right</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600/30 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-green-400">↓</span>
              </div>
              <div>
                <h4 className="font-semibold">Swipe Down</h4>
                <p className="text-sm opacity-80">Drop piece faster</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600/30 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400">↑</span>
              </div>
              <div>
                <h4 className="font-semibold">Swipe Up</h4>
                <p className="text-sm opacity-80">Rotate piece</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-600/30 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-400">👆</span>
              </div>
              <div>
                <h4 className="font-semibold">Tap</h4>
                <p className="text-sm opacity-80">Quick tap to rotate piece</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-4">
            <p className="text-sm opacity-70 italic">
              💡 Tip: You can also tap the preview pieces above the board to swap upcoming pieces!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`${skin.buttonStyle} w-full mt-6`}
        >
          Got it!
        </button>
      </div>
    </div>
  )
}