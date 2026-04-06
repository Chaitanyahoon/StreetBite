import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://streetbite.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/profile/',
          '/debug/',
          '/reset-password/'
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
