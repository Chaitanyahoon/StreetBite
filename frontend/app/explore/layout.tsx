import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Street Food Vendors Near You',
  description: 'Find and discover the best street food vendors in your area. Browse by cuisine, rating, and distance.',
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
