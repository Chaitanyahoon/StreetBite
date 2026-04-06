import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://streetbite.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/vendor/dashboard/', '/vendor/settings/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
