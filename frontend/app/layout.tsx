import type { Metadata } from 'next'
import Script from 'next/script'
import { GOOGLE_MAPS_API_KEY } from '@/lib/maps-config'
import { Archivo, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

import { OrganizationSchema } from '@/components/seo/organization-schema'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'

export const metadata: Metadata = {
  metadataBase: new URL('https://streetbitego.vercel.app'),
  title: {
    default: 'StreetBite — Discover Authentic Street Food Near You',
    template: '%s | StreetBite',
  },
  description: 'Discover the best street food near you. Geolocation-based discovery of authentic street food vendors in your city.',
  generator: 'streetbite-app',
  openGraph: {
    title: 'StreetBite — Discover Amazing Street Food',
    description: 'Find top-rated street food vendors, join the community, and track your foodie journey.',
    url: 'https://streetbitego.vercel.app',
    siteName: 'StreetBite',
    images: [
      {
        url: '/og-image.jpg',
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
import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${spaceGrotesk.variable} ${archivo.variable} font-sans antialiased text-foreground selection:bg-primary/20 selection:text-primary`}>
        <OrganizationSchema />
        <AuthProvider>
          <GamificationProvider>
            <NotificationProvider>
              {children}
              <CookieConsentBanner />
              <Toaster position="top-center" />
            </NotificationProvider>
          </GamificationProvider>
        </AuthProvider>
        <Analytics />
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
