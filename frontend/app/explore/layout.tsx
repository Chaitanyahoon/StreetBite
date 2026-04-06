import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Local Street Food | StreetBite',
  description: 'Discover nearby street food vendors, compare ratings, filter by cuisine, and explore open stalls on StreetBite.',
  alternates: {
    canonical: 'https://streetbitego.vercel.app/explore',
  },
  openGraph: {
    title: 'Explore Street Food Near You | StreetBite',
    description: 'Find local street food flavors by cuisine, rating, distance, and live availability.',
    url: 'https://streetbitego.vercel.app/explore',
    type: 'website',
    images: [
      {
        url: 'https://streetbitego.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StreetBite explore page preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Street Food Near You | StreetBite',
    description: 'Browse authentic nearby street food vendors with smarter filters and map discovery.',
    images: ['https://streetbitego.vercel.app/og-image.jpg'],
  },
  keywords: [
    'street food near me',
    'local food vendors',
    'street food map',
    'food stalls near me',
    'street food offers',
  ],
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
