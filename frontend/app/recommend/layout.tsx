import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Food Recommender | Find What To Eat | StreetBite',
  description: 'Not sure what to eat? Take our AI-powered 3-step quiz to find the perfect street food match according to your budget and vibe.',
  keywords: ['what to eat', 'food recommender', 'food quiz', 'street food finder', 'AI food suggestions', 'cheap eats near me'],
  alternates: {
    canonical: 'https://streetbitego.vercel.app/recommend',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'AI Food Recommender | StreetBite',
    description: 'Find your perfect street food match instantly with our AI quiz.',
    url: 'https://streetbitego.vercel.app/recommend',
    type: 'website',
  }
}

export default function RecommendLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
