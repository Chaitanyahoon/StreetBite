import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Foodies Community | StreetBite',
  description: 'Join the largest street food community. Discuss flavors, participate in food polls, and see what the streets are cooking.',
  alternates: {
    canonical: 'https://streetbitego.vercel.app/community',
  },
  openGraph: {
    title: 'StreetBite Community | The Foodie Social',
    description: 'Connect with other foodies and discover hidden street gems.',
    url: 'https://streetbitego.vercel.app/community',
    type: 'website',
  }
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
