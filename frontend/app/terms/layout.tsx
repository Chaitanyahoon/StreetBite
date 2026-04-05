import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'StreetBite terms of service — rules and guidelines for using our platform.',
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
