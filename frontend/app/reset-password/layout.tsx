import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Your Password',
  description: 'Reset your StreetBite account password securely.',
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
