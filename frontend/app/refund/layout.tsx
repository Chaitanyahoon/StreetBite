import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'StreetBite refund policy — our guidelines for refunds and cancellations.',
}

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
