import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Foodie Profile',
  description: 'View your StreetBite profile, track your foodie stats, badges, and review history.',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
