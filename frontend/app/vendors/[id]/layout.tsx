import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vendor Details',
  description: 'View menu, reviews, offers, and directions for this street food vendor on StreetBite.',
}

export default function VendorDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
