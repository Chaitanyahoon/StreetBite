import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About StreetBite — Our Mission',
  description: 'Learn about StreetBite, our mission to connect food lovers with the best street food vendors, and how we are building the future of street food discovery.',
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
