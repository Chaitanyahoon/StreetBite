import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Local Street Food | StreetBite',
  description: 'Discover the best street food vendors near you. Browse by cuisine, rating, and distance with our interactive map.',
  alternates: {
    canonical: 'https://streetbitego.vercel.app/explore',
  },
  openGraph: {
    title: 'Explore Street Food Near You | StreetBite',
    description: 'Find local street food flavors on our interactive map.',
    url: 'https://streetbitego.vercel.app/explore',
    type: 'website',
  }
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
