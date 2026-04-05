import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Your StreetBite Account',
  description: 'Join StreetBite as a food lover or vendor. Discover, review, and share the best street food in your city.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
