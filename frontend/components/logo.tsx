import Link from 'next/link'
import Image from 'next/image'

export function Logo() {
  return (
    <div className="flex items-center gap-2 group">
      <div className="relative w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
        <Image src="/logo.png" alt="StreetBite Logo" width={40} height={40} className="object-contain" suppressHydrationWarning />
      </div>
      <span className="font-heading font-bold text-2xl tracking-tight text-foreground">
        Street<span className="text-primary">Bite</span>
      </span>
    </div>
  )
}
