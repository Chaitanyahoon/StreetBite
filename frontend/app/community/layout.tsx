import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Feed — Street Food Stories & Reviews',
  description: 'Join the StreetBite community. Share your street food adventures, read reviews, and discover trending food topics.',
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
