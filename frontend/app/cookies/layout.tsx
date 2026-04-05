import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'StreetBite cookie policy — how we use cookies to improve your experience.',
}

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
