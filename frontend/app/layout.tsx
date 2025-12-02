import type { Metadata } from 'next'
import { Outfit, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'StreetBite - Discover Amazing Street Food',
  description: 'Discover the best street food near you. Geolocation-based discovery of authentic street food vendors in your city.',
  generator: 'streetbite-app',
  icons: {
    icon: '/brand-icon.png',
    apple: '/apple-icon.png',
  },
}

import { NotificationProvider } from '@/components/notification-provider'
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground selection:bg-primary/20 selection:text-primary`}>
        <NotificationProvider>
          {children}
          <Toaster position="top-center" />
        </NotificationProvider>
        <Analytics />
      </body>
    </html>
  )
}
