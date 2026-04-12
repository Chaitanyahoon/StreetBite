import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Foodies Community | Gamified Social Feed | StreetBite',
  description: 'Join the premier street food community. Climb the Flavor Leaderboards, accept Bite Bounties, and chat directly with top street food vendors!',
  keywords: ['food community', 'flavor leaderboard', 'foodie forum', 'street food chat', 'foodie bounties', 'bite bounties'],
  alternates: {
    canonical: 'https://streetbitego.vercel.app/community',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'StreetBite Community | Flavor Leaderboards & Bounties',
    description: 'Connect with other foodies, earn rank in our Flavor Leaderboards, and discover hidden street gems.',
    url: 'https://streetbitego.vercel.app/community',
    type: 'website',
  }
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
