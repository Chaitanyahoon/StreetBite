import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hot Deals & Offers on Street Food',
  description: 'Grab the best deals and promo codes from street food vendors near you. Save big on your favorite local flavors.',
}

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
