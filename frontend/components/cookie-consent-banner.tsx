'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const CONSENT_KEY = 'streetbite_cookie_consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const savedConsent = window.localStorage.getItem(CONSENT_KEY)
      setVisible(!savedConsent)
    } catch {
      setVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, 'accepted')
    } catch {
      // Ignore storage failures and just hide the banner for this session.
    }
    setVisible(false)
  }

  if (!visible) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-[70] px-4 sm:bottom-6 sm:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border-4 border-black bg-[#fffaf0] text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-4 border-black bg-[#ff6b35] px-5 py-4 sm:px-7">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-black">Cookie Consent</p>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <p className="text-base font-bold leading-7 text-black/85 sm:text-lg">
            StreetBite uses cookies to keep your session active, remember preferences, and improve the overall experience.
            You can review the details or accept and continue.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={acceptCookies}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-4 border-black bg-[#ff6b35] px-6 text-base font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:bg-[#f25a22]"
            >
              Accept
            </button>

            <Link
              href="/cookies"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-4 border-black bg-white px-6 text-base font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:bg-[#fff3d9]"
            >
              Manage Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
