import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hot Deals & Offers on Street Food',
  description: 'Grab the best deals and promo codes from street food vendors near you. Save big on your favorite local flavors.',
  alternates: {
    canonical: 'https://streetbitego.vercel.app/offers',
  },
  openGraph: {
    title: 'Street Food Deals and Offers | StreetBite',
    description: 'Browse fresh promo codes and food deals from local street food vendors.',
    url: 'https://streetbitego.vercel.app/offers',
    type: 'website',
    images: [
      {
        url: 'https://streetbitego.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StreetBite offers page preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Street Food Deals and Offers | StreetBite',
    description: 'Save on nearby street food with fresh local offers and promo codes.',
    images: ['https://streetbitego.vercel.app/og-image.jpg'],
  },
}

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
