import type { Metadata } from 'next'
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
    default: 'StreetBite — Fast, Local & Authentic Street Food Discovery',
    template: '%s | StreetBite',
  },
  description: 'Uncover hidden street food gems in your city. From local food trucks to underground night markets, rank up in our foodie community and find your next craving.',
  keywords: ['street food', 'local eats', 'authentic cuisine', 'food truck', 'gamified food discovery', 'foodie community', 'night markets'],
  generator: 'streetbite-app',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
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
      </body>
    </html>
  )
}
