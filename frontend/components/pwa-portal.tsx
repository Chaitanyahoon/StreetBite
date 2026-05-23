'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2, Plus, WifiOff, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { playSuccess, triggerHaptic } from '@/lib/sound-effects'

export function PwaPortal() {
  const isOnline = useOnlineStatus()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showIosGuide, setShowIosGuide] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check standalone mode
    const standaloneMatch = window.matchMedia('(display-mode: standalone)').matches
    const isSafariStandalone = (navigator as any).standalone === true
    setIsStandalone(standaloneMatch || isSafariStandalone)

    // Check iOS
    const iosRegex = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iosRegex)

    // Capture install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if dismissed previously in session
    const dismissed = sessionStorage.getItem('pwa-install-dismissed') === 'true'
    setIsDismissed(dismissed)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true)
      triggerHaptic(50)
      return
    }

    if (!deferredPrompt) return

    triggerHaptic(50)
    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      playSuccess()
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('pwa-install-dismissed', 'true')
    triggerHaptic(40)
  }

  // Determine visibility of install prompt
  const showPrompt =
    !isStandalone &&
    !isDismissed &&
    (deferredPrompt !== null || isIOS)

  return (
    <>
      {/* Offline Status Alert */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 inset-x-0 z-[100] p-3 bg-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider text-center border-b-4 border-black shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2"
          >
            <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
            <span>Connection Lost! StreetBite is running locally via Offline Cache. 🔌</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Promotion Banner */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-40"
          >
            <div className="bg-yellow-300 border-4 border-black p-4 sm:p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col gap-3">
              <button
                onClick={handleDismiss}
                className="absolute top-2.5 right-2.5 p-1 bg-white hover:bg-gray-100 border-2 border-black rounded-lg transition-colors text-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3.5 pr-8">
                <div className="p-2.5 bg-black border-2 border-black rounded-xl text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] shrink-0">
                  <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-black text-black text-sm uppercase tracking-tight leading-none mb-1">
                    Install StreetBite
                  </h4>
                  <p className="text-[10px] sm:text-xs font-bold text-black/80 leading-snug">
                    Discover local vendors fast by adding StreetBite to your home screen!
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <Button
                  onClick={handleInstallClick}
                  className="flex-1 bg-black text-white hover:bg-orange-500 font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(128,128,128,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl h-10 text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  Install App
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="bg-white hover:bg-gray-50 text-black font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl h-10 px-3.5 text-xs sm:text-sm uppercase cursor-pointer"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Manual Installation Guide Dialog */}
      <Dialog open={showIosGuide} onOpenChange={setShowIosGuide}>
        <DialogContent className="max-w-sm w-[92vw] border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 bg-white text-black">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Add to Home Screen</DialogTitle>
            <DialogDescription className="text-xs font-bold text-gray-500">
              Install StreetBite on your iPhone using Safari controls.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-7 h-7 bg-black text-white rounded-lg border-2 border-black flex items-center justify-center font-black text-xs">1</div>
              <p className="text-[11px] font-bold leading-tight">
                Tap Safari's <span className="underline decoration-wavy decoration-orange-500 font-black">Share Button</span> <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-orange-500" /> at the bottom menu.
              </p>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-7 h-7 bg-black text-white rounded-lg border-2 border-black flex items-center justify-center font-black text-xs">2</div>
              <p className="text-[11px] font-bold leading-tight">
                Select <span className="underline decoration-wavy decoration-orange-500 font-black">Add to Home Screen</span> <Plus className="w-3.5 h-3.5 inline mx-0.5 text-orange-500" /> option from details list.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-7 h-7 bg-black text-white rounded-lg border-2 border-black flex items-center justify-center font-black text-xs">3</div>
              <p className="text-[11px] font-bold leading-tight">
                Click <span className="font-black text-orange-600">Add</span> in the top right corner of screen. Done! 🎉
              </p>
            </div>
          </div>

          <Button
            onClick={() => { setShowIosGuide(false); triggerHaptic(40); }}
            className="w-full bg-black hover:bg-orange-500 text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(128,128,128,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl h-11 text-xs sm:text-sm uppercase cursor-pointer"
          >
            Got It!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
