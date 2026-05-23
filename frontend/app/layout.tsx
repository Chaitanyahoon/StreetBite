import type { Metadata } from 'next'
import { Archivo, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
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

export const metadata: Metadata = {
  metadataBase: new URL('https://streetbitego.vercel.app'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StreetBite',
  },
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
import { PwaPortal } from '@/components/pwa-portal'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${spaceGrotesk.variable} ${archivo.variable} font-sans antialiased text-foreground selection:bg-primary/20 selection:text-primary`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-yellow-300 focus:text-black focus:border-2 focus:border-black focus:font-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:rounded-xl">
          Skip to main content
        </a>
        <OrganizationSchema />
        <AuthProvider>
          <GamificationProvider>
            <NotificationProvider>
              <main id="main-content">
                {children}
              </main>
              <PwaPortal />
              <Toaster position="top-center" />
            </NotificationProvider>
          </GamificationProvider>
        </AuthProvider>
        <Analytics />
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('StreetBite ServiceWorker registered successfully:', reg.scope);
                  }).catch(function(err) {
                    console.log('StreetBite ServiceWorker registration failed:', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  )
}
