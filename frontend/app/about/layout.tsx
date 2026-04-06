import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About StreetBite | The Street Food Revolution',
  description: 'Learn about the mission behind StreetBite. We are empowering local street food vendors and connecting foodies with hidden culinary gems.',
  alternates: {
    canonical: 'https://streetbitego.vercel.app/about',
  },
  openGraph: {
    title: 'The StreetBite Story | Empowering Local Vendors',
    description: 'Discover how we are digitizing the street food ecosystem.',
    url: 'https://streetbitego.vercel.app/about',
    type: 'website',
  }
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
