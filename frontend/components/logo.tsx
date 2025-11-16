import { useState } from 'react'

export function Logo() {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        {!imgError ? (
          <img
            src="/streetbite-logo.png"
            alt="StreetBite"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg
            viewBox="0 0 40 40"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" className="text-primary" />
          </svg>
        )}
      </div>
      <span className="font-black text-lg text-foreground">
        Street<span className="text-primary">Bite</span>
      </span>
    </div>
  )
}

