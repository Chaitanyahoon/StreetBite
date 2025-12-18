import type { Metadata } from 'next'
import Script from 'next/script'
import { GOOGLE_MAPS_API_KEY } from '@/lib/maps-config'
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
  openGraph: {
    title: 'StreetBite - Discover Amazing Street Food',
    description: 'Find top-rated street food vendors, join the community, and track your foodie journey.',
    url: 'https://streetbite.app',
    siteName: 'StreetBite',
    images: [
      {
        url: '/og-image.jpg', // Ensure this image exists or use a placeholder
        width: 1200,
        height: 630,
        alt: 'StreetBite App Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreetBite',
    description: 'Discover the best street food near you.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/brand-icon.png',
    apple: '/apple-icon.png',
  },
}

import { NotificationProvider } from '@/components/notification-provider'
import { Toaster } from 'sonner'

import { GamificationProvider } from '@/context/GamificationContext'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans antialiased text-foreground selection:bg-primary/20 selection:text-primary`}>
        <GamificationProvider>
          <NotificationProvider>
            {children}
            <Toaster position="top-center" />
          </NotificationProvider>
        </GamificationProvider>
        <Analytics />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
      </body>
    </html>
  )
}
