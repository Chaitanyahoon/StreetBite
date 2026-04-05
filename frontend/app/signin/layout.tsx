import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In to StreetBite',
  description: 'Sign in to your StreetBite account to access your favorites, reviews, and foodie profile.',
}

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
