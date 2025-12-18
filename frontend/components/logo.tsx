import Link from 'next/link'

export function Logo() {
  return (
    <div className="flex items-center gap-2 group">
      <div className="relative w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6">
        <img suppressHydrationWarning src="/logo.png" alt="StreetBite Logo" className="w-full h-full object-contain" />
      </div>
      <span className="font-black text-3xl tracking-tighter uppercase text-black" style={{ textShadow: '2px 2px 0px #fff' }}>
        STREET<span className="text-orange-600 inline-block transform -rotate-2 bg-black text-white px-1 ml-0.5 border-2 border-transparent" style={{ textShadow: 'none' }}>BITE</span>
      </span>
    </div>
  )
}
